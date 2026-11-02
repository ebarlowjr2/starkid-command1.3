-- Additive launch notifications. Delivery and scheduling are configured separately.
begin;
create table public.launch_alert_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  reminder_minutes integer[] not null default '{60,10}',
  schedule_changes boolean not null default false,
  updated_at timestamptz not null default now(),
  check (reminder_minutes <@ array[60,10] and array_position(reminder_minutes,null) is null
    and (cardinality(reminder_minutes)<2 or (cardinality(reminder_minutes)=2 and reminder_minutes[1]<>reminder_minutes[2])))
);
create table public.launch_alert_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  launch_id uuid not null,
  launch_name text not null check (length(launch_name) between 1 and 180),
  active boolean not null default true,
  subscribed_at timestamptz not null default now(),
  primary key(user_id,launch_id)
);
create index launch_alert_active_launch_idx on public.launch_alert_subscriptions(launch_id) where active;
create table public.launch_push_devices (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_token text not null unique check (expo_token ~ '^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$'),
  platform text not null check(platform in ('ios','android')),
  last_seen_at timestamptz not null default now(),
  enabled boolean not null default true
);
create index launch_push_devices_user_idx on public.launch_push_devices(user_id);
create table public.launch_alert_snapshots (
  launch_id uuid primary key,
  payload jsonb not null,
  checked_at timestamptz not null default now()
);
create table public.launch_alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null references public.launch_push_devices(id) on delete cascade,
  launch_id uuid not null,
  event_key text not null,
  payload jsonb not null,
  state text not null default 'pending' check(state in ('pending','sending','ticket','accepted','failed','unknown','expired')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ticket_id text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(device_id,launch_id,event_key)
);
create index launch_alert_pending_idx on public.launch_alert_deliveries(next_attempt_at) where state='pending';
create index launch_alert_receipts_idx on public.launch_alert_deliveries(updated_at) where state='ticket';
create index launch_alert_deliveries_user_idx on public.launch_alert_deliveries(user_id);
create table public.launch_alert_worker_state (
  id boolean primary key default true check(id),
  run_id uuid,
  locked_until timestamptz not null default '-infinity',
  next_poll_at timestamptz not null default '-infinity'
);
insert into public.launch_alert_worker_state(id) values(true);
alter table public.launch_alert_preferences enable row level security;
alter table public.launch_alert_subscriptions enable row level security;
alter table public.launch_push_devices enable row level security;
alter table public.launch_alert_snapshots enable row level security;
alter table public.launch_alert_deliveries enable row level security;
alter table public.launch_alert_worker_state enable row level security;
revoke all on public.launch_alert_preferences,public.launch_alert_subscriptions,public.launch_push_devices,
  public.launch_alert_snapshots,public.launch_alert_deliveries,public.launch_alert_worker_state from anon,authenticated;
grant select,insert,update on public.launch_alert_preferences to authenticated;
grant select on public.launch_alert_subscriptions to authenticated;
grant select,delete on public.launch_push_devices to authenticated;
grant all on public.launch_alert_preferences,public.launch_alert_subscriptions,public.launch_push_devices,
  public.launch_alert_snapshots,public.launch_alert_deliveries,public.launch_alert_worker_state to service_role;
create policy own_launch_preferences on public.launch_alert_preferences for all to authenticated
  using ((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_launch_subscriptions on public.launch_alert_subscriptions for select to authenticated using ((select auth.uid())=user_id);
create policy own_launch_devices_read on public.launch_push_devices for select to authenticated using ((select auth.uid())=user_id);
create policy own_launch_devices_delete on public.launch_push_devices for delete to authenticated using ((select auth.uid())=user_id);

create function public.set_launch_watch(p_launch_id uuid,p_launch_name text,p_active boolean default true)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,10));
  if p_active and not exists(select 1 from public.launch_alert_subscriptions where user_id=v_user and launch_id=p_launch_id and active)
    and (select count(*) from public.launch_alert_subscriptions where user_id=v_user and active)>=50 then
    raise exception 'Launch watch limit reached';
  end if;
  insert into public.launch_alert_preferences(user_id) values(v_user) on conflict do nothing;
  insert into public.launch_alert_subscriptions(user_id,launch_id,launch_name,active) values(v_user,p_launch_id,left(p_launch_name,180),p_active)
    on conflict(user_id,launch_id) do update set active=excluded.active,launch_name=excluded.launch_name,
    subscribed_at=case when not public.launch_alert_subscriptions.active and excluded.active then now() else public.launch_alert_subscriptions.subscribed_at end;
  if not p_active then
    update public.launch_alert_deliveries set state='expired',updated_at=now() where user_id=v_user and launch_id=p_launch_id and state='pending';
  end if;
end $$;
create function public.register_launch_push_device(p_installation_id uuid,p_token text,p_platform text)
returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_token !~ '^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$' or p_platform not in ('ios','android') then raise exception 'Invalid push registration'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_token,11));
  delete from public.launch_push_devices where (installation_id=p_installation_id or expo_token=p_token)
    and (user_id<>v_user or installation_id<>p_installation_id);
  insert into public.launch_push_devices(installation_id,user_id,expo_token,platform) values(p_installation_id,v_user,p_token,p_platform)
    on conflict(installation_id) do update set expo_token=excluded.expo_token,platform=excluded.platform,enabled=true,last_seen_at=now();
end $$;
create function public.claim_launch_alert_run(p_run_id uuid,p_interval_seconds integer default 300)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.launch_alert_worker_state set run_id=p_run_id,locked_until=now()+interval '90 seconds',
    next_poll_at=now()+make_interval(secs=>greatest(60,p_interval_seconds))
    where id and locked_until<now() and next_poll_at<=now();
  return found;
end $$;
create function public.record_launch_alert_batch(p_run_id uuid,p_snapshots jsonb,p_events jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare v jsonb;
begin
  perform 1 from public.launch_alert_worker_state where id and run_id=p_run_id and locked_until>now() for update;
  if not found then raise exception 'Expired worker lease'; end if;
  for v in select value from jsonb_array_elements(p_snapshots) loop
    insert into public.launch_alert_snapshots(launch_id,payload,checked_at) values((v->>'id')::uuid,v,(v->>'fetchedAt')::timestamptz)
      on conflict(launch_id) do update set payload=excluded.payload,checked_at=excluded.checked_at;
  end loop;
  for v in select value from jsonb_array_elements(p_events) loop
    insert into public.launch_alert_deliveries(user_id,device_id,launch_id,event_key,payload,expires_at)
    select s.user_id,d.id,s.launch_id,v->>'key',v,(v->>'expiresAt')::timestamptz
    from public.launch_alert_subscriptions s
      join public.launch_alert_preferences p on p.user_id=s.user_id and p.enabled
      join public.launch_push_devices d on d.user_id=s.user_id and d.enabled and d.last_seen_at>now()-interval '30 days'
    where s.active and s.launch_id=(v->'snapshot'->>'id')::uuid and s.subscribed_at<=(v->'snapshot'->>'fetchedAt')::timestamptz
      and ((v->>'kind'='reminder' and (v->>'minutes')::integer=any(p.reminder_minutes)) or (v->>'kind'<>'reminder' and p.schedule_changes))
    on conflict(device_id,launch_id,event_key) do nothing;
  end loop;
end $$;
create function public.claim_launch_alert_deliveries(p_launch_ids uuid[])
returns setof jsonb language plpgsql security definer set search_path='' as $$
declare v record;
begin
  update public.launch_alert_deliveries set state='expired',updated_at=now() where state='pending' and expires_at<=now();
  update public.launch_alert_deliveries set state='unknown',error_code='interrupted_send',updated_at=now()
    where state='sending' and updated_at<now()-interval '2 minutes';
  for v in
    select q.id,q.payload,q.attempts,d.expo_token,p.enabled,p.reminder_minutes,p.schedule_changes,s.subscribed_at,n.payload as snapshot
    from public.launch_alert_deliveries q
      join public.launch_alert_subscriptions s on s.user_id=q.user_id and s.launch_id=q.launch_id and s.active
      join public.launch_alert_preferences p on p.user_id=q.user_id and p.enabled
      join public.launch_push_devices d on d.id=q.device_id and d.user_id=q.user_id and d.enabled and d.last_seen_at>now()-interval '30 days'
      join public.launch_alert_snapshots n on n.launch_id=q.launch_id
    where q.state='pending' and q.next_attempt_at<=now() and q.expires_at>now() and q.attempts<3 and q.launch_id=any(p_launch_ids)
    order by q.created_at limit 100 for update of q skip locked
  loop
    update public.launch_alert_deliveries set state='sending',attempts=attempts+1,updated_at=now() where id=v.id;
    return next jsonb_build_object('id',v.id,'event',v.payload,'attempts',v.attempts+1,'token',v.expo_token,'snapshot',v.snapshot,
      'preferences',jsonb_build_object('enabled',v.enabled,'reminder_minutes',v.reminder_minutes,'schedule_changes',v.schedule_changes),'subscribedAt',v.subscribed_at);
  end loop;
end $$;
revoke all on function public.set_launch_watch(uuid,text,boolean),public.register_launch_push_device(uuid,text,text),public.claim_launch_alert_run(uuid,integer),
  public.record_launch_alert_batch(uuid,jsonb,jsonb),public.claim_launch_alert_deliveries(uuid[]) from public,anon,authenticated;
grant execute on function public.set_launch_watch(uuid,text,boolean),public.register_launch_push_device(uuid,text,text) to authenticated;
grant execute on function public.claim_launch_alert_run(uuid,integer),public.record_launch_alert_batch(uuid,jsonb,jsonb),public.claim_launch_alert_deliveries(uuid[]) to service_role;
commit;
