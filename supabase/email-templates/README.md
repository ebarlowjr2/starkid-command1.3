# Supabase Auth Email Templates

## Confirm Signup

Use `confirm-signup.html` in Supabase Dashboard:

1. Open **Authentication -> Email Templates -> Confirm signup**.
2. Set the subject to `Confirm your StarKid Command profile`.
3. Replace the template body with the contents of `confirm-signup.html` and save.

The confirmation button uses Supabase's `{{ .ConfirmationURL }}` variable. Do not replace that value: Supabase generates the signed confirmation URL and applies the redirect requested by the web or mobile signup flow.

## Required URL Configuration

In **Authentication -> URL Configuration**, retain the production site URL and allow these redirect URLs:

- `https://www.starkidcommand.com/auth/callback`
- `https://www.starkidcommand.com/auth/callback?redirect=*`
- `starkidcommand://auth/callback`

The web callback lets a confirmed user choose to continue online or return to the mobile app. The deep link returns mobile confirmations to the Expo application.

## Production Notes

- Keep email-provider click tracking disabled for authentication emails; rewritten links can invalidate Supabase confirmation URLs.
- Test with a real non-admin address after saving the template.
- If email security scanners consume confirmation links before users can click them, move to an OTP confirmation flow rather than changing this template.
