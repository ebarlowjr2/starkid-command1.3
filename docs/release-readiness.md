# Release Readiness — StarKid Command

Target: **App Store launch by April 1**

This document is the running source of truth for launch status, blockers, and rollback plan.

## 1) Launch Blockers (Must Fix Before Submission)
- TBD (keep this list short and real)

## 2) Completed Items
- Web legal pages: `/about`, `/privacy`, `/terms`
- Mobile links to About/Privacy/Terms (Profile + Onboarding)
- Internal web QA route: `/launch-checklist` (gated by `VITE_ENABLE_LAUNCH_CHECKLIST`)
- Mobile onboarding shown once (local persistence)
- Learning flow: list → detail → lesson player → submit → completion
- XP award-once logic (requires QA verification per build)
- Account deletion entry available in Profile

## 3) Remaining App Store Assets
- App Store screenshots (device sizes + key flows)
- App Store “What to Test” notes per build
- Final “App Review Notes” text (if needed)
- Final privacy answers in App Store Connect (data collection declarations)

## 4) Known Issues / Watchlist
- Large web bundle size warning (Vite chunk > 500 kB). Not a blocker, but watch performance.
- Progress sync reliability depends on network + Supabase availability.

## 5) QA Checklist Links
- Web QA route (enable only during QA window): `/launch-checklist`
- Legal:
  - `/about`
  - `/privacy`
  - `/terms`

## 6) Rollback Plan
Web (Vercel)
- Roll back production by redeploying the previous successful build or switching production branch/tag.
- If QA checklist was enabled, disable `VITE_ENABLE_LAUNCH_CHECKLIST` and redeploy.

Mobile (TestFlight)
- Stop distributing the affected build in TestFlight groups.
- Submit a hotfix build with a higher build number.

## 7) Monitoring / Error Reporting (Placeholder Plan)
We are not implementing full monitoring in this pass, but we need a plan and a clean insertion point.

### Mobile (Expo)
Option A: Sentry (recommended)
- Add Sentry SDK to `apps/mobile`.
- Initialize in `apps/mobile/App.tsx` early (before app shell renders).
- Capture:
  - unhandled exceptions
  - promise rejections
  - navigation breadcrumbs (optional)
- Ensure PII scrubbing and safe defaults.

Option B: Expo error reporting only (minimum)
- Rely on Expo + device logs for early TestFlight phase.

### Web
Option A: Sentry (recommended)
- Add Sentry browser SDK in `apps/web/src/main.jsx`.
- Capture route errors + unhandled exceptions.
- Tie release versions to git SHA.

Option B: Lightweight console + Vercel logs (minimum)
- Use Vercel function logs + client console logs for early QA.

## 8) Operational Notes
- Keep `/launch-checklist` enabled only for the QA window.
- Before public launch, confirm:
  - no dev-only routes are exposed
  - legal links are visible and correct
  - delete account path works end-to-end

