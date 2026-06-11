-- StarKid Content Command Center
-- Central content object, social captions, app links, and outgoing automation events.

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),

  content_type text not null,
  status text not null default 'candidate',

  title text not null,
  slug text unique,
  excerpt text,
  body text,

  seo_title text,
  seo_description text,
  hero_image_url text,
  stem_tie_in text,
  app_cta text,

  source_name text,
  source_url text,
  source_published_at timestamptz,

  fact_source_name text,
  fact_source_url text,
  verified_manually boolean default false,

  topic text,
  company text,
  mission_name text,

  traffic_score integer default 0,
  stem_score integer default 0,

  is_launch_related boolean default false,
  is_lunar_related boolean default false,
  is_stem_related boolean default false,

  requires_review boolean default true,
  auto_approved boolean default false,

  scheduled_for timestamptz,
  published_at timestamptz,

  created_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,

  rejection_reason text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table social_posts
  add column if not exists content_item_id uuid references content_items(id) on delete cascade,
  add column if not exists caption text,
  add column if not exists media_url text,
  add column if not exists sent_to_buffer_at timestamptz,
  add column if not exists buffer_payload jsonb,
  add column if not exists buffer_response jsonb;

create table if not exists content_app_links (
  id uuid primary key default gen_random_uuid(),

  content_item_id uuid references content_items(id) on delete cascade,

  link_type text not null,
  target_id text,
  cta_text text,

  created_at timestamptz default now()
);

create table if not exists content_webhook_events (
  id uuid primary key default gen_random_uuid(),

  content_item_id uuid references content_items(id) on delete cascade,

  webhook_type text not null,
  destination text not null,

  payload jsonb not null,
  response jsonb,

  status text not null default 'pending',
  error_message text,

  created_at timestamptz default now(),
  sent_at timestamptz
);

create index if not exists idx_content_items_status on content_items(status);
create index if not exists idx_content_items_type on content_items(content_type);
create index if not exists idx_content_items_scheduled on content_items(scheduled_for);
create index if not exists idx_content_items_review on content_items(status) where requires_review = true;
create index if not exists idx_social_posts_content_item on social_posts(content_item_id);
create index if not exists idx_content_app_links_content_item on content_app_links(content_item_id);
create index if not exists idx_content_webhook_events_content_item on content_webhook_events(content_item_id);
create index if not exists idx_content_webhook_events_status on content_webhook_events(status);

alter table content_items enable row level security;
alter table content_app_links enable row level security;
alter table content_webhook_events enable row level security;

create policy "Allow public read for published content" on content_items
  for select using (status in ('published', 'scheduled', 'sent_to_buffer'));

create policy "Allow service role full access to content items" on content_items
  for all using (auth.role() = 'service_role');

create policy "Allow service role full access to content app links" on content_app_links
  for all using (auth.role() = 'service_role');

create policy "Allow service role full access to content webhook events" on content_webhook_events
  for all using (auth.role() = 'service_role');

drop trigger if exists update_content_items_updated_at on content_items;
create trigger update_content_items_updated_at
  before update on content_items
  for each row
  execute function update_updated_at_column();
