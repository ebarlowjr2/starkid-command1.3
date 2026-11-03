# Launch notifications

Users sign in, choose **Notify Me** on a Launch Library launch, and allow phone
notifications. Profile contains **Launch Notifications** with 1-hour / 10-minute
reminders, optional schedule/status changes, watched launches, and a per-phone
switch. Permission is requested only after a user action. Web manages the same
watches and preferences; browser push is not implemented.

## Architecture

`packages/core/src/services/launchAlertRules.ts` contains source validation, reminder
windows, reschedule revisions and notification navigation validation.
`launchAlertsService.ts` owns Supabase calls and device registration.
`launchAlertsController.ts` shares one observable account-aware store across cards.
The mobile native adapter handles Expo permissions, token renewal, foreground
presentation and notification taps. Sign-out waits for in-flight registration and
removes this phone before clearing its session. Shared-phone registration replaces
the previous account binding. Account deletion cascades notification records.

Migration `010_launch_alerts.sql` adds six isolated tables and scoped RPCs. RLS lets
users read/write their own preferences, manage their watches and remove their own
phone. Worker tables and sending functions are restricted to the service role.
`supabase/tests/launch_alerts.sql` verifies isolation, reassignment, deduplication,
exclusive delivery claims and deletion cleanup in a disposable database.

The `launch-alerts` Edge Function accepts POST with a private scheduler bearer
secret, uses a database lease, fetches up to 50 watched launch IDs per poll, queues
eligible events atomically, and sends batches of 100 through Expo. Each device,
launch and event has a unique delivery key. Missing, old, held or imprecisely timed
launches do not produce countdown reminders. A reminder is eligible for five
minutes after its threshold; missed reminders are not replayed later. Revisions
allow a new reminder for a genuinely rescheduled target.

Expo tickets are checked after 15 minutes. Invalid tokens are disabled. Explicit
429/5xx failures retry at most three times while the event remains valid. Ambiguous
network results are recorded as unknown and are not blindly resent. Provider
handoff does not prove delivery to a person. Expired events are dropped. At the
five-minute default poll rate short reminders may expire before a retry; the system
prioritizes current information over late delivery. Up to 1,000 deliveries are
processed per run, with a 45-second sending budget. Monitor capacity before scaling
beyond 50 distinct active watched launches. Source API plan quotas must accommodate
the polling rate and other app traffic.

## Configuration and deployment

- Mobile: `EXPO_PUBLIC_ENABLE_LAUNCH_ALERTS=true` in the production EAS profile;
  `expo-notifications`, `expo-device`, `expo-constants` and native plugin require a
  new app binary. A real device and APNs/FCM credentials are required for delivery.
- Web: controls are enabled by default in this release. Set
  `VITE_ENABLE_LAUNCH_ALERTS=false` at build time to hide them.
- Backend: `LAUNCH_ALERT_DELIVERY_ENABLED=true` and a random
  `LAUNCH_ALERT_CRON_SECRET`. `LAUNCH_ALERT_POLL_SECONDS` defaults to 300.
- Optional `LAUNCH_LIBRARY_TOKEN` uses the provider's authenticated quota.
- Optional `EXPO_ACCESS_TOKEN` is required if Expo enhanced push security is enabled.
  Without enhanced security, Expo accepts the server's token-addressed requests.
  Never put server credentials in EXPO_PUBLIC or VITE variables.

Apply only migration 010 after reviewing existing migrations. Deploy with:

```sh
supabase functions deploy launch-alerts --project-ref inmroieynoddtyytnvbp --no-verify-jwt --use-api
```

JWT verification is replaced by the function's private scheduler-secret check.
Store `launch_alert_function_url` and `launch_alert_cron_secret` in Supabase Vault,
then run `supabase/launch-alerts-cron.sql`. A minute cron invokes the function; the
DB lease throttles actual polling. Do not commit secret values.

Disable delivery immediately with `LAUNCH_ALERT_DELIVERY_ENABLED=false`; remove
`starkid-launch-alerts` from pg_cron to stop invocation. Disable client flags in a
subsequent web/mobile build to hide controls. Existing learning/auth data is not
modified by the notification migration.

## Device verification

1. Install the new TestFlight build. Browse launches as a guest; Notify Me opens
   the existing identity prompt without requesting notification permission.
2. Sign in, watch a future launch, grant permission, and confirm the watched
   launch in Profile. Denying permission shows guidance and permits browsing.
3. Confirm one reminder during a controlled due window, then tap it from
   foreground, background and cold start. The correct launch briefing must open.
4. Verify global pause, individual removal, phone disable, sign-out and switching
   accounts stop delivery to the old account. Re-enable explicitly after sign-in.
5. Confirm schedule changes use fresh source data, duplicate runs do not create a
   second queue row, invalid tokens are disabled and expired alerts are not sent.
6. Test APNs delivery on a physical iPhone. A successful JS export or EAS build
   does not verify device delivery. No production notification should be fabricated
   to test a real launch; use an opted-in tester and controlled data in staging.

## Release verification - November 2, 2026

- Changes pushed to `main` and `codex/launch-notifications`; web deployment passed
  and production `/profile` serves the new notification controls.
- 86 core tests pass, including sender freshness, opt-out and ambiguous-send cases.
  SQL migration/security checks pass. Web production build and iOS JS export pass.
  Browser checks pass at desktop and 390px width, including the guest auth prompt.
- iOS build **34** completed successfully:
  https://expo.dev/accounts/onecirclesolutions/projects/starkid-command/builds/935cc3ca-2435-497f-9e5c-16c9d947e413
- Expo Device 5.9.4 requires the committed pnpm patch for Xcode 26 Swift simulator
  detection. The lockfile includes the patch; retain it until the Expo SDK upgrade.
- Apple rejected automatic submission with
  `EAS_ASC_REQUIRED_AGREEMENTS_MISSING_OR_EXPIRED`. The Account Holder must accept
  the required terms at https://appstoreconnect.apple.com/business and, if prompted,
  https://developer.apple.com/account. Then resubmit the existing build:

  ```sh
  eas submit --platform ios --id 935cc3ca-2435-497f-9e5c-16c9d947e413 --profile production --non-interactive
  ```

- Backend schema, function and minute scheduler are installed. Scheduler requests
  return HTTP 200. The owner approved sharing the existing team push key, and EAS
  confirmed it is assigned to StarKid. Delivery is **enabled**
  (`LAUNCH_ALERT_DELIVERY_ENABLED=true`). The existing key was neither replaced nor
  revoked. A submission retry still reports the missing/expired Apple agreement.
- Physical iPhone delivery, permission prompts and notification taps still require
  the TestFlight checks above after Apple accepts the upload and the key is linked.
