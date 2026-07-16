# Content Command Center Wiki

This is the operator knowledge base for StarKid Command's blog-first content workflow.

The Content Command Center manages one central content item that can produce a blog post, app CTA, STEM tie-in, social captions, and a webhook payload for Zapier, Buffer, or another automation tool.

## Current Production Shape

- Admin UI: `/admin/content`
- Legacy ops login helper: `/ops/social-queue`
- Content API: `/api/content`
- Config check: `/api/content/config`
- Production deploy target: Vercel
- Database: Supabase
- Automation bridge: Zapier Catch Hook
- Social scheduler: Buffer

The Vercel project currently behaves as if its root directory is `apps/web`, so API functions are also mirrored under `apps/web/api`. Keep the repo-root `api` files and the `apps/web/api` copies in sync when changing content API behavior.

## Key Files

- `apps/web/src/pages/admin/ContentCommandCenterPage.jsx`
- `api/content/_store.js`
- `api/content/_actions.js`
- `api/content/index.js`
- `apps/web/api/content/_store.js`
- `apps/web/api/content/_actions.js`
- `apps/web/api/content/index.js`
- `supabase/migrations/008_create_content_command_center.sql`
- `supabase/migrations/009_add_content_test_mode.sql`
- `docs/content-command-center-production-test-plan.md`

## Required Vercel Environment Variables

Set these for the deployed environment you are testing, usually Production:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPS_ACCESS_KEY
CONTENT_AUTOMATION_WEBHOOK_URL
CONTENT_AUTOMATION_WEBHOOK_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY` must be the Supabase service role key, not the anon key.

`CONTENT_AUTOMATION_WEBHOOK_URL` should be the full Zapier Catch Hook URL:

```txt
https://hooks.zapier.com/hooks/catch/...
```

`CONTENT_AUTOMATION_WEBHOOK_SECRET` is optional for the current Zapier test, but keep it populated so the config check is green and future automations can verify StarKid requests.

After changing Vercel env vars, redeploy. Existing deployments do not pick up new values automatically.

## Supabase Setup

Run these migrations in Supabase SQL Editor, in order:

```txt
supabase/migrations/008_create_content_command_center.sql
supabase/migrations/009_add_content_test_mode.sql
```

Migration `008` creates:

- `content_items`
- `content_app_links`
- `content_webhook_events`
- additional content-related columns on `social_posts`

Migration `009` adds:

- `content_items.is_test`
- public read policy tightened to published content

## Health Check

Open:

```txt
/api/content/config
```

Expected:

```json
{
  "webhookConfigured": true,
  "webhookSecretConfigured": true,
  "supabaseConfigured": true
}
```

If `webhookSecretConfigured` is false, webhook sending can still work, but Vercel is missing `CONTENT_AUTOMATION_WEBHOOK_SECRET` or needs redeploy.

If `supabaseConfigured` is false, check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Admin Authentication

Admin actions require the browser to store the ops key.

1. Open `/ops/social-queue`.
2. Enter the value from `OPS_ACCESS_KEY`.
3. After it accepts, return to `/admin/content`.

The old social queue may show `Failed to load drafts`; that legacy error does not block the Content Command Center. The important signal is that the page shows a Logout button, which means the ops key was accepted.

If `/admin/content` returns `OPS_ACCESS_REQUIRED (401)`, authenticate again through `/ops/social-queue` or clear/re-enter the session key.

## Approval Rules

Auto-approved source-based types:

```txt
news
artemis_update
spacex_update
launch_update
new_space_company_update
```

These start as `approved` and can be distributed after social captions exist.

Review-required educational types:

```txt
random_space_fact
today_in_space
stem_mission_companion
evergreen_stem
app_update
```

These start as `needs_review`.

Review-required content cannot be approved unless it has one of:

- `source_url`
- `fact_source_url`
- `verified_manually = true`

This guardrail protects StarKid's educational voice and STEM accuracy.

## Smoke Test Workflow

In `/admin/content`, click:

```txt
Create Smoke Test Items
```

This creates five test items:

- `TEST SpaceX Update`, expected `approved`
- `TEST Artemis Update`, expected `approved`
- `TEST Random Space Fact`, expected `needs_review`
- `TEST Today in Space`, expected `needs_review`
- `TEST STEM Mission Companion`, expected `needs_review`

All are marked `TEST CONTENT`.

See the full checklist in `docs/content-command-center-production-test-plan.md`.

## Normal Content Workflow

For source-based news:

```txt
Create item
Generate Social Pack
Send to Buffer
Confirm Zapier received payload
Confirm Buffer queued post
```

For review-required educational content:

```txt
Create item
Add source URL, fact source URL, or check Verified manually
Save
Approve
Generate Social Pack
Send to Buffer
Confirm Zapier received payload
Confirm Buffer queued post
```

## Zapier Setup

Trigger:

```txt
Webhooks by Zapier -> Catch Hook
```

Leave `Pick off a Child Key` blank.

Use the generated Catch Hook URL as `CONTENT_AUTOMATION_WEBHOOK_URL` in Vercel.

After changing the webhook URL, redeploy Vercel, then send a fresh webhook from StarKid and click `Find new records` in Zapier.

## Zapier Payload Fields

The webhook payload includes both a `platforms` array and flat fields for easier Zapier mapping.

Use the flat fields in Zapier:

```txt
xCaption
facebookCaption
instagramCaption
linkedinCaption
threadsCaption
youtubeShortsCaption
```

Also available:

```txt
contentItemId
isTest
title
contentType
sourceName
sourceUrl
blogUrl
scheduledFor
appCta
appLinkType
```

If Zapier shows only `Platforms Caption`, you are using an old sample. Send a fresh webhook from StarKid, then click `Find new records` in Zapier and select the newest request.

## Buffer Setup

Current Buffer channels:

- X
- Facebook Page

For X action:

```txt
App: Buffer
Action event: Add to Queue
Channel: X
Text: xCaption
Media: no
Method: Add to Queue
```

For Facebook action:

```txt
App: Buffer
Action event: Add to Queue
Channel: Facebook Page
Text: facebookCaption
Media: no
Method: Add to Queue
```

Test each Buffer action manually in Zapier before publishing the Zap.

If Buffer queues a post that literally says `Platforms Caption`, the wrong Zapier field was mapped. Replace it with `xCaption` or `facebookCaption`.

## Important Platform Note

Not every content type generates every platform caption.

For example, `stem_mission_companion` defaults to:

```txt
facebook
linkedin
instagram
```

So `xCaption` may be blank for that type.

Use `TEST SpaceX Update`, `TEST Artemis Update`, `news`, `spacex_update`, `artemis_update`, or `launch_update` when testing X.

## Statuses

Common statuses:

- `needs_review`: admin must approve before distribution
- `approved`: ready to generate/send social distribution
- `sent_to_buffer`: webhook accepted by automation endpoint
- `failed`: webhook send failed; retry after fixing URL/env/config
- `published`: public blog publishing status

`sent_to_buffer` means StarKid successfully sent the payload to Zapier. It does not guarantee Zapier posted to Buffer. Check Zapier Zap Runs and Buffer queue for downstream confirmation.

## Troubleshooting

`OPS_ACCESS_REQUIRED (401)`

Authenticate through `/ops/social-queue`, then retry `/admin/content`.

`FUNCTION_INVOCATION_FAILED (500)`

Check whether `/api/content/config` returns JSON. If config works but `/api/content` fails, inspect the Vercel function logs and make sure the `apps/web/api` copy is self-contained and not importing outside the Vercel root.

`Request failed (405)`

Usually means Vercel routed `/api/*` to the frontend app instead of a function. Confirm `apps/web/vercel.json` excludes `/api/` from SPA rewrites:

```json
{ "source": "/((?!api/).*)", "destination": "/" }
```

`Failed to parse URL from ...`

The webhook URL env var contains the secret or another non-URL value. Set:

```txt
CONTENT_AUTOMATION_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
CONTENT_AUTOMATION_WEBHOOK_SECRET=your-random-secret
```

`Review-required educational content needs a source URL or manual verification before approval. (400)`

Add `Source URL`, `Fact source URL`, or check `Verified manually`, then Save and Approve.

Zapier receives no new record

Confirm Vercel uses the same Catch Hook URL as the Zap you are viewing. Redeploy after env changes. Send a fresh StarKid webhook, then click `Find new records`.

Buffer receives `Platforms Caption`

Zapier mapped the label instead of a value. Use a fresh webhook sample and map `xCaption` or `facebookCaption`.

## Release Checklist For Future Changes

1. Update both root API files and `apps/web/api` copies when content API logic changes.
2. Run `pnpm -C apps/web build`.
3. Commit and push to `main`.
4. Wait for Vercel deployment.
5. Check `/api/content/config`.
6. Send a test webhook from an approved `TEST` item.
7. Confirm Zapier catches the new request.
8. Confirm Buffer queues the expected text.

## Product Guardrail

Do not let this become a generic space blog. Each item should satisfy at least one:

- Helps users track a space event
- Connects to a launch
- Connects to a lunar event
- Teaches a STEM idea
- Encourages app usage
- Makes StarKid feel like Mission Control for young learners

If not, reject it or mark it low priority.
