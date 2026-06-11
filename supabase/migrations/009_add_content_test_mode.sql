-- Production smoke-test safety for Content Command Center.

alter table content_items
  add column if not exists is_test boolean default false;

drop policy if exists "Allow public read for approved posts" on content_items;
drop policy if exists "Allow public read for published content" on content_items;

create policy "Allow public read for published content" on content_items
  for select using (status = 'published');

create index if not exists idx_content_items_is_test on content_items(is_test);
