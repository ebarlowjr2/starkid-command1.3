# QA Results — Launch Readiness

Date Tested: _TBD_  
Web Build (Vercel): _TBD_  
iOS Build (TestFlight): _TBD_  
Tester(s): _TBD_  
Devices:
- Simulator: _TBD_
- Physical iPhone: _TBD_

## 1) Web QA — /launch-checklist

Prereq:
- Vercel Production env var: `VITE_ENABLE_LAUNCH_CHECKLIST=true`
- Redeploy production
- Visit: `https://www.starkidcommand.com/launch-checklist`

Record the page results below.

| Check | Result | Notes |
|---|---|---|
| Legal pages reachable (About/Privacy/Terms) | TBD |  |
| Published modules visible | TBD |  |
| Draft modules hidden from learners | TBD |  |
| Mission start requires auth | TBD |  |
| Progress resumes (authed) | TBD |  |
| XP awarded once | TBD |  |

## 2) Web Manual Smoke Tests

| Area | Result | Notes |
|---|---|---|
| Home loads (`/`) | TBD |  |
| Profile (`/profile`) | TBD |  |
| Learning Hub (`/learning`) | TBD |  |
| STEM Activities (`/learning/stem`) | TBD |  |
| Module detail loads | TBD |  |
| Lesson player loads | TBD |  |
| Delete account reachable | TBD |  |

## 3) TestFlight QA Script Results

Use: `docs/testflight-qa-script.md`

| Section | Result | Notes |
|---|---|---|
| First launch + onboarding | TBD |  |
| Branding (icon/splash/name) | TBD |  |
| Guest browsing | TBD |  |
| Login/signup + session persistence | TBD |  |
| Mission start auth gate | TBD |  |
| Lesson player flow | TBD |  |
| Progress save + resume | TBD |  |
| Submit + completion + return home | TBD |  |
| XP awarded once | TBD |  |
| Logout/login resume | TBD |  |
| Bad connection behavior | TBD |  |
| Legal links + delete account | TBD |  |

## 4) Issues Log

Only **BLOCKER** and **HIGH** can be fixed before submission.

| ID | Severity | Area | Repro Steps | Expected | Actual | Status | Fix Commit |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

Severity definitions:
- **BLOCKER**: crashes, broken auth, unusable learning flow, legal missing, cannot delete account, published content not loading
- **HIGH**: major broken UX that impacts core actions but may have workaround
- **MEDIUM/LOW**: polish; defer unless it becomes a blocker

