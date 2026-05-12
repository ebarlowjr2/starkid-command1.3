-- Profiles table + rank helper.
-- This is intentionally minimal and App-Store-ready: a durable place for username and learning stats.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  xp_total integer not null default 0,
  rank text not null default 'Cadet',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_profiles_updated_at();

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

alter table public.profiles enable row level security;

drop policy if exists "profiles_owner_read" on public.profiles;
create policy "profiles_owner_read"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_owner_insert" on public.profiles;
create policy "profiles_owner_insert"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update"
on public.profiles
for update
using (auth.uid() = id);

-- Optional: allow the service role to manage profiles (works automatically with supabase service key).

-- Keep rank values consistent.
create or replace function public.learning_rank_for_xp(xp integer)
returns text as $$
begin
  if xp is null then return 'Cadet'; end if;
  if xp >= 1000 then return 'Commander'; end if;
  if xp >= 500 then return 'Operator'; end if;
  if xp >= 200 then return 'Specialist'; end if;
  if xp >= 75 then return 'Explorer'; end if;
  return 'Cadet';
end;
$$ language plpgsql immutable;

