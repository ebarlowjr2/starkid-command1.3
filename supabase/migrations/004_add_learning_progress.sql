create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text not null,
  lesson_slug text,
  status text not null default 'not_started',
  current_step_index integer not null default 0,
  total_steps integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  last_activity_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

create table if not exists public.learning_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text not null,
  lesson_slug text,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.set_learning_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_learning_progress_updated_at on public.learning_progress;
create trigger set_learning_progress_updated_at
before update on public.learning_progress
for each row execute procedure public.set_learning_progress_updated_at();

alter table public.learning_progress enable row level security;
alter table public.learning_submissions enable row level security;

drop policy if exists "learning_progress_owner_read" on public.learning_progress;
create policy "learning_progress_owner_read"
on public.learning_progress
for select
using (auth.uid() = user_id);

drop policy if exists "learning_progress_owner_write" on public.learning_progress;
create policy "learning_progress_owner_write"
on public.learning_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "learning_progress_owner_update" on public.learning_progress;
create policy "learning_progress_owner_update"
on public.learning_progress
for update
using (auth.uid() = user_id);

drop policy if exists "learning_submissions_owner_read" on public.learning_submissions;
create policy "learning_submissions_owner_read"
on public.learning_submissions
for select
using (auth.uid() = user_id);

drop policy if exists "learning_submissions_owner_write" on public.learning_submissions;
create policy "learning_submissions_owner_write"
on public.learning_submissions
for insert
with check (auth.uid() = user_id);
