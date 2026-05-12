# TestFlight QA Script — StarKid Command

This is the step-by-step QA script for TestFlight builds. Run the full checklist on at least one real device and one simulator.

## Preflight
- Confirm build version shown in TestFlight matches the expected release.
- Confirm device is online and has a stable connection for the first run.
- Optional: enable Airplane Mode later for the “bad connection” test.

## 1) First Launch + Onboarding
1. Install the TestFlight build and open the app.
2. Confirm onboarding appears on first open.
3. Tap through:
   - Welcome
   - Learn Through Missions
   - Earn Progress
4. Confirm Privacy + Terms links open in browser.
5. Finish onboarding.
6. Force close the app and reopen.
7. Confirm onboarding does **not** re-appear.

Expected:
- Onboarding is shown once.
- Legal links open correctly.
- App does not crash or hang at first launch.

## 2) App Shell / Branding
1. Confirm app name displays as “StarKid Command”.
2. Confirm app icon is correct on the home screen.
3. Confirm splash screen displays (no obvious flashing / broken asset).
4. Confirm global navigation is visible and functional.

Expected:
- Branding assets render correctly.
- No missing icons or layout breaks.

## 3) Guest Browsing (No Login)
1. Ensure you are signed out.
2. Browse these main sections:
   - Home / Command Center
   - Missions hub
   - Learning Hub
   - STEM Activities list
   - Profile (should show guest/local profile messaging)

Expected:
- Guest can browse core app surfaces.
- App does not force sign-in for browsing.

## 4) Auth Flow (Signup / Login)
1. Create a new account (email/password) OR log into an existing account.
2. Confirm session persists after:
   - force close + reopen
   - switching tabs

Expected:
- Login succeeds.
- Session persists.

## 5) Mission Start Auth Gate (Learning)
1. As a guest, open:
   - Learning Hub → STEM Activities
2. Open a module detail screen.
3. Press “START MISSION”.

Expected:
- The app requires identity/auth before mission execution (Initialize/Sync prompt).

## 6) Lesson Player Flow (Authed)
1. While signed in, open:
   - STEM Activities → module detail → START MISSION
2. Verify lesson player UI:
   - Step indicator increments (Step X of N)
   - Back/Continue works
3. Enter answers in interactive steps.
4. Navigate back and forward.

Expected:
- Answers persist within the session when navigating steps.
- No UI crashes during step transitions.

## 7) Progress Save + Resume
1. In the lesson player, complete several steps but do not submit.
2. Force close the app.
3. Reopen the app.
4. Return to the same module and start mission again.

Expected:
- The player resumes progress (step index restored).
- Previous answers are restored.

## 8) Submit + Completion State
1. Complete the module and press “SUBMIT”.
2. Confirm completion screen appears.
3. Confirm there is a “RETURN HOME” button.
4. Tap “RETURN HOME”.

Expected:
- Completion messaging appears.
- Return home works.

## 9) XP Awarded Once
1. Note total XP (Profile).
2. Complete the same module again (or attempt to resubmit).

Expected:
- XP is awarded only once per module completion.
- Total XP does not increase repeatedly for the same module.

## 10) Logout / Login Resume
1. With in-progress progress saved, sign out.
2. Sign in again with the same account.
3. Return to the module and start mission.

Expected:
- Progress resumes for that user account.

## 11) Bad Connection / Progress Save Failure
1. Start a lesson and reach an input step.
2. Turn on Airplane Mode (or disable Wi-Fi/cellular).
3. Try to continue / change answers.

Expected:
- App does not crash.
- A clear warning appears if progress sync fails.
- User can continue the lesson (best-effort local session state).

## 12) Profile Links + Account Deletion
1. Open Profile.
2. Confirm:
   - About link works
   - Privacy Policy link works
   - Terms link works
3. Confirm Logout works.
4. Confirm Delete Account entry exists (do not execute on production accounts unless intended).

Expected:
- Legal links open.
- Delete account is reachable and clearly labeled.

## Reporting Template (Copy/Paste)
- Device / iOS version:
- Build version:
- Steps attempted:
- Result:
- Screenshots / video:
- Logs / error text:
- Severity (blocker / high / medium / low):

