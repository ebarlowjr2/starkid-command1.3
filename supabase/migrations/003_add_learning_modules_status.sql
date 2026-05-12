alter table if exists public.learning_modules
  add column if not exists status text default 'draft',
  add column if not exists submitted_for_review_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.learning_modules
set status = 'published', published_at = coalesce(published_at, now())
where id = 'math.launch.fuel-ratio' and (status is null or status = 'draft');

update public.learning_modules
set status = 'draft'
where status is null and id <> 'math.launch.fuel-ratio';
