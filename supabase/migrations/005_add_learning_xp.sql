alter table if exists public.learning_modules
  add column if not exists xp_reward integer not null default 0;

update public.learning_modules
set xp_reward = 50
where id = 'math.launch.fuel-ratio' and (xp_reward is null or xp_reward = 0);

alter table if exists public.learning_progress
  add column if not exists xp_awarded boolean not null default false,
  add column if not exists xp_awarded_at timestamptz;

create table if not exists public.learning_user_progression (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_learning_user_progression_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_learning_user_progression_updated_at on public.learning_user_progression;
create trigger set_learning_user_progression_updated_at
before update on public.learning_user_progression
for each row execute procedure public.set_learning_user_progression_updated_at();

alter table public.learning_user_progression enable row level security;

drop policy if exists "learning_user_progression_owner_read" on public.learning_user_progression;
create policy "learning_user_progression_owner_read"
on public.learning_user_progression
for select
using (auth.uid() = user_id);

drop policy if exists "learning_user_progression_owner_write" on public.learning_user_progression;
create policy "learning_user_progression_owner_write"
on public.learning_user_progression
for insert
with check (auth.uid() = user_id);

drop policy if exists "learning_user_progression_owner_update" on public.learning_user_progression;
create policy "learning_user_progression_owner_update"
on public.learning_user_progression
for update
using (auth.uid() = user_id);
