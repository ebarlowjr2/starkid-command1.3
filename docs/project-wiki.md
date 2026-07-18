# StarKid Command Project Wiki

This is the top-level knowledge base for the StarKid Command repo.

StarKid Command is a live mission-control experience for space exploration and STEM learning. It combines public space data, mission tracking, sky-event awareness, learning modules, and an admin content workflow designed to keep StarKid educational, source-aware, and useful for young learners.

## Project Goals

- Make space exploration feel like an interactive Mission Control experience.
- Help users track launches, sky events, lunar events, missions, planets, rockets, spacecraft, and comets.
- Turn space events into STEM learning moments.
- Support guest-first usage with a path toward account sync.
- Maintain a kid-appropriate, STEM-aligned editorial voice.
- Keep operational tools simple enough to run before full custom integrations exist.

## Product Surfaces

### Web App

Path:

```txt
apps/web
```

Stack:

- Vite
- React
- Tailwind
- React Router
- Three.js / React Three Fiber for 3D views
- Supabase client where needed
- Vercel serverless functions

Main entry points:

- `apps/web/src/main.jsx`
- `apps/web/src/App.jsx`
- `apps/web/src/index.css`

The web app is the primary deployed product and hosts the admin Content Command Center.

### Mobile App

Path:

```txt
apps/mobile
```

Stack:

- Expo
- React Native
- React Navigation
- Sentry React Native
- Shared `@starkid/core` and `@starkid/types`

Main entry points:

- `apps/mobile/App.tsx`
- `apps/mobile/index.js`
- `apps/mobile/app.config.js`
- `apps/mobile/eas.json`

The mobile app mirrors the main StarKid experiences and is covered by the app-store and TestFlight docs.

### Shared Core Package

Path:

```txt
packages/core
```

Purpose:

- Shared services
- STEM engine
- profile/identity logic
- data normalization
- cross-platform domain behavior

Package:

```txt
@starkid/core
```

### Shared Types Package

Path:

```txt
packages/types
```

Purpose:

- Shared TypeScript types
- model-viewer declarations
- cross-app type contracts

Package:

```txt
@starkid/types
```

## Monorepo Commands

From the repo root:

```bash
corepack enable
corepack prepare pnpm@9.12.2 --activate
pnpm install
pnpm dev
pnpm build
pnpm test
```

Common scripts:

```txt
pnpm dev      -> pnpm -C apps/web dev
pnpm build    -> pnpm -C apps/web build
pnpm test     -> pnpm -C packages/core test
```

Web-only:

```bash
pnpm -C apps/web dev
pnpm -C apps/web build
pnpm -C apps/web preview
```

Mobile:

```bash
pnpm -C apps/mobile start
pnpm -C apps/mobile ios
pnpm -C apps/mobile android
```

## Deployment

Primary deployment target:

```txt
Vercel
```

Important deployment detail:

The Vercel project currently behaves as if the root directory is:

```txt
apps/web
```

Because of that, API functions used by production are mirrored under:

```txt
apps/web/api
```

Repo-root API functions also exist under:

```txt
api
```

When changing content API behavior, keep both copies in sync unless the Vercel root strategy is intentionally changed.

Relevant Vercel config files:

- `vercel.json`
- `apps/web/vercel.json`

The `apps/web/vercel.json` rewrite must not swallow API routes:

```json
{ "source": "/((?!api/).*)", "destination": "/" }
```

## Environment Variables

Core deployed app variables include:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
OPS_ACCESS_KEY
CONTENT_AUTOMATION_WEBHOOK_URL
CONTENT_AUTOMATION_WEBHOOK_SECRET
VITE_SENTRY_DSN
VITE_SENTRY_SEND_PII
VITE_ENABLE_LAUNCH_CHECKLIST
OPENAI_API_KEY
```

Content Command Center variables are documented in:

```txt
docs/content-command-center-wiki.md
```

After editing Vercel environment variables, redeploy. Existing deployments do not pick up new values automatically.

## Serverless API

Repo-root API path:

```txt
api
```

Web-root mirrored API path:

```txt
apps/web/api
```

Important APIs:

- `/api/content/*` - Content Command Center CRUD, review, social pack, webhook send
- `/api/content/config` - deployment config health check
- `/api/ops/auth` - ops key authentication
- `/api/ai/comet-chat` - C.O.M.E.T. chat
- `/api/ai/comet-generate-post` - legacy social draft generation
- `/api/social/scheduler` - social post scheduling cron
- `/api/watch/sky-events` - sky event watch cron
- `/api/watch/events` - event watch endpoint
- `/api/news` - news endpoint
- `/api/sky-events` - sky events endpoint
- `/api/youtube-live` - YouTube live status
- `/api/account/delete` - account deletion

Shared Supabase helper:

- `api/_lib/supabase.js`
- `apps/web/api/_lib/supabase.js`

## Database

Supabase migrations live in:

```txt
supabase/migrations
```

Migration history includes:

- `001_create_mission_events.sql`
- `002_create_social_posts.sql`
- `003_add_learning_modules_status.sql`
- `004_add_learning_progress.sql`
- `005_add_learning_xp.sql`
- `006_seed_space_learning_modules.sql`
- `007_create_profiles_and_rank.sql`
- `007_seed_artemis_docking_challenge.sql`
- `008_create_content_command_center.sql`
- `009_add_content_test_mode.sql`

Content Command Center requires migrations `008` and `009`.

## Architecture Rules

The main architecture reference is:

```txt
docs/ARCHITECTURE.md
```

Core rule:

Apps should call shared services for domain behavior instead of duplicating data fetching or normalization in screens.

Services-first areas include:

- launches
- sky events
- alerts
- comets
- solar activity
- STEM mission generation
- STEM progress
- profile service

Shared service result shape:

```txt
{ data, sources, warnings? }
```

Where source status entries look like:

```txt
{ name, ok, count?, error? }
```

## Major Feature Areas

### Mission Control / Command Center

The core user-facing concept: a live mission-control dashboard for upcoming events, alerts, launches, and learning opportunities.

Related files include:

- `apps/web/src/pages/CommandCenterPage.jsx`
- `apps/mobile/src/screens/CommandCenterScreen.tsx`
- `packages/core/src/index.ts`

### Updates Hub

User-facing update pages:

- official updates
- news
- blog
- live
- X/social

Web paths include:

- `/updates`
- `/updates/news`
- `/updates/blog`
- `/updates/live`
- `/updates/x`
- `/updates/official`

Related files:

- `apps/web/src/pages/updates`
- `apps/mobile/src/screens/Updates*`

### Content Command Center

Admin content operations:

```txt
/admin/content
```

Purpose:

- create central content items
- enforce approval rules
- generate social captions
- send webhook payloads to Zapier/Buffer
- protect STEM mission alignment

Full guide:

```txt
docs/content-command-center-wiki.md
```

Production test checklist:

```txt
docs/content-command-center-production-test-plan.md
```

### Learning / STEM

The STEM module powers structured activities and dynamic mission companions.

Reference:

```txt
docs/STEM.md
docs/learning-foundation.md
docs/learning-player.md
docs/learning-module-template-standard.md
```

Important principles:

- Activities and dynamic missions share templates and grading.
- AI may enhance copy but must not alter grading logic or answer keys.
- Progress must flow through shared progress services.
- Guest users can complete learning flows locally.

Web routes include:

- `/learning`
- `/learning/stem`
- `/learning/cyberlab`
- `/learning/admin`
- `/learning/lesson/:slug`

### Missions / Artemis / Rockets / Spacecraft

Mission and vehicle views include:

- Artemis hub
- SLS detail
- Orion detail
- rockets hub
- spacecraft hub
- rocket detail
- spacecraft detail

Related web paths:

- `/missions/artemis`
- `/missions/artemis/sls`
- `/missions/artemis/orion`
- `/rockets`
- `/rockets/launch-vehicles`
- `/rockets/spacecraft`

### Sky Events / Tonight's Mission

Sky event features help users know what to look for and when.

Related web paths:

- `/sky-events`
- `/tonights-mission`

Related API:

- `/api/sky-events`
- `/api/watch/sky-events`

### Solar Map / Planets / Mars

Exploration surfaces include:

- solar map
- planets hub
- Mars command center
- planet details

Related web paths:

- `/solar-map`
- `/planets`
- `/planets/mars`

### Beyond Solar System / Comets

Exploration surfaces for exoplanets and comet tracking.

Related web paths:

- `/beyond`
- `/comets`
- `/comets/:designation`

### Profile / Account / Identity

StarKid uses a guest-first identity model.

Principles:

- anonymous users get a local actor ID
- public features work in guest mode
- future authenticated users can sync/migrate state

Related web paths:

- `/profile`
- `/auth/callback`

Related API:

- `/api/account/delete`

## Admin and Ops Tools

Admin-ish routes:

- `/admin/content`
- `/learning/admin`
- `/learning/admin/add`
- `/learning/admin/approve`
- `/ops/social-queue`

`/ops/social-queue` is also used to authenticate the ops key for Content Command Center API actions.

The legacy social queue may display `Failed to load drafts`; that does not block the new Content Command Center.

## Content Automation

Current production flow:

```txt
StarKid Content Command Center
        ↓
Zapier Catch Hook
        ↓
Buffer
        ↓
X and Facebook Page
```

Current flattened webhook fields:

```txt
xCaption
facebookCaption
instagramCaption
linkedinCaption
threadsCaption
youtubeShortsCaption
```

Use `xCaption` for Buffer X and `facebookCaption` for Buffer Facebook Page.

If a caption is blank, that content type may not generate that platform by default.

## Documentation Map

Top-level docs:

- `README.md` - quickstart and pointers
- `docs/project-wiki.md` - this full project overview
- `docs/ARCHITECTURE.md` - service-first architecture rules
- `docs/SETUP.md` - local setup
- `docs/STEM.md` - STEM engine overview
- `docs/content-command-center-wiki.md` - content ops knowledge base
- `docs/content-command-center-production-test-plan.md` - production content test checklist
- `docs/release-readiness.md` - release readiness
- `docs/REGRESSION.md` - regression tracking
- `docs/PARITY.md` - parity notes
- `docs/qa-results.md` - QA results
- `docs/testflight-qa-script.md` - TestFlight QA flow
- `docs/app-store-submission.md` - app store submission
- `docs/launch-night-checklist.md` - launch-night checklist
- `docs/impact.md` - impact notes
- `docs/grant-description.md` - grant-facing description

## Common Troubleshooting

### Vercel API Shows `405`

Likely cause: `/api/*` is being routed to the SPA.

Check:

- `apps/web/vercel.json`
- Vercel root directory
- API files under `apps/web/api`

### Vercel API Shows `FUNCTION_INVOCATION_FAILED`

Open:

```txt
/api/content/config
```

If config works but another function fails, check the Vercel function logs and confirm `apps/web/api` does not import outside the deployed root.

### `OPS_ACCESS_REQUIRED (401)`

Open `/ops/social-queue`, enter `OPS_ACCESS_KEY`, then return to the admin route.

### Supabase Errors

Confirm:

- Vercel has `SUPABASE_URL`
- Vercel has `SUPABASE_SERVICE_ROLE_KEY`
- migrations have been applied
- the service role key is not the anon key

### Zapier Receives No Record

Confirm:

- Vercel has the exact Zapier Catch Hook URL
- Vercel was redeployed after env changes
- the Zapier trigger is looking at the same hook
- StarKid sent a fresh webhook after the Zap was configured

### Buffer Queues Wrong Text

If Buffer receives `Platforms Caption`, Zapier mapped a label instead of a field value.

Use:

- `xCaption` for X
- `facebookCaption` for Facebook Page

## Release Workflow

For code changes:

1. Check current git status.
2. Make focused edits.
3. Run the relevant build/test:

```bash
pnpm -C apps/web build
pnpm -C packages/core test
```

4. Commit only relevant files.
5. Push to `main`.
6. Wait for Vercel.
7. Smoke test affected routes.

For content automation changes:

1. Update root API files.
2. Update matching `apps/web/api` files.
3. Run `pnpm -C apps/web build`.
4. Push.
5. Check `/api/content/config`.
6. Send a test webhook.
7. Confirm Zapier and Buffer.

## Product Guardrails

StarKid should feel like Mission Control for young learners, not a generic space website.

When adding features or content, ask:

- Does this help users track a space event?
- Does this connect to a launch, mission, lunar event, or sky event?
- Does this teach a STEM idea?
- Does this encourage meaningful app usage?
- Is the tone age-appropriate and source-aware?

If the answer is no, rethink the feature or content.

## Open Follow-Ups

- Decide whether to keep the duplicated `api` and `apps/web/api` structure or consolidate Vercel root behavior.
- Add Buffer mapping for Instagram once the channel is connected.
- Add Reddit automation path through Zapier or another service.
- Consider a native admin auth flow instead of using `/ops/social-queue` for session setup.
- Add a public blog integration for published `content_items` when ready.
- Improve code sharing between web and mobile screens where parity matters.
