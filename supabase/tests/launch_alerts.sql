-- Run against a disposable database after 010_launch_alerts.sql. Always rolls back.
begin;
insert into auth.users(id) values('eeeeeeee-0000-4000-8000-000000000001'),('eeeeeeee-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000001',true);
select public.set_launch_watch('11111111-1111-4111-8111-111111111111','QA launch',true);
select public.register_launch_push_device('22222222-2222-4222-8222-222222222222','ExpoPushToken[testDevice]','ios');
do $$ begin
  if (select count(*) from public.launch_alert_subscriptions)<>1 then raise exception 'own watch missing'; end if;
  if has_table_privilege('authenticated','public.launch_alert_deliveries','SELECT') then raise exception 'delivery records exposed'; end if;
  if has_function_privilege('authenticated','public.claim_launch_alert_run(uuid,integer)','EXECUTE') then raise exception 'worker callable by learner'; end if;
end $$;
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000002',true);
do $$ begin
  if (select count(*) from public.launch_alert_subscriptions)<>0 then raise exception 'cross-user watch exposed'; end if;
  if (select count(*) from public.launch_push_devices)<>0 then raise exception 'cross-user token exposed'; end if;
  begin
    insert into public.launch_alert_preferences(user_id) values('eeeeeeee-0000-4000-8000-000000000001');
    raise exception 'cross-user write allowed';
  exception when insufficient_privilege then null; end;
end $$;
-- A shared phone must be reassigned, never shared across accounts.
select public.register_launch_push_device('22222222-2222-4222-8222-222222222222','ExpoPushToken[testDevice]','ios');
reset role;
do $$ begin
  if (select count(*) from public.launch_push_devices where user_id='eeeeeeee-0000-4000-8000-000000000001')<>0 then raise exception 'old account retains device'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','eeeeeeee-0000-4000-8000-000000000002',true);
select public.set_launch_watch('11111111-1111-4111-8111-111111111111','QA launch',true);
reset role;
select public.claim_launch_alert_run('33333333-3333-4333-8333-333333333333',60);
do $$ declare snap jsonb; event jsonb; n integer; begin
  snap:=jsonb_build_object('id','11111111-1111-4111-8111-111111111111','name','QA launch','net',now()+interval '10 minutes','status',1,'precision',0,'revision',1,'fetchedAt',now());
  event:=jsonb_build_object('key','reminder:10:test','kind','reminder','minutes',10,'snapshot',snap,'expiresAt',now()+interval '5 minutes');
  perform public.record_launch_alert_batch('33333333-3333-4333-8333-333333333333',jsonb_build_array(snap),jsonb_build_array(event));
  perform public.record_launch_alert_batch('33333333-3333-4333-8333-333333333333',jsonb_build_array(snap),jsonb_build_array(event));
  if (select count(*) from public.launch_alert_deliveries)<>1 then raise exception 'duplicate delivery queued'; end if;
  select count(*) into n from public.claim_launch_alert_deliveries(array['11111111-1111-4111-8111-111111111111'::uuid]);
  if n<>1 then raise exception 'eligible delivery not claimed'; end if;
  select count(*) into n from public.claim_launch_alert_deliveries(array['11111111-1111-4111-8111-111111111111'::uuid]);
  if n<>0 then raise exception 'delivery claimed twice'; end if;
end $$;
delete from auth.users where id='eeeeeeee-0000-4000-8000-000000000002';
do $$ begin
  if exists(select 1 from public.launch_alert_deliveries) then raise exception 'account deletion did not cascade'; end if;
end $$;
rollback;
