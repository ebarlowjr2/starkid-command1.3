# Supabase Auth Email Templates

## Confirm Signup

Use `confirm-signup.html` in Supabase Dashboard:

1. Open **Authentication -> Email Templates -> Confirm signup**.
2. Set the subject to `Confirm your StarKid Command profile`.
3. Replace the template body with the contents of `confirm-signup.html` and save.

The confirmation button uses Supabase's `{{ .ConfirmationURL }}` variable. Do not replace that value: Supabase generates the signed confirmation URL and applies the redirect requested by the web or mobile signup flow.

## Reset Password

Use `reset-password.html` in Supabase Dashboard:

1. Open **Authentication -> Email Templates -> Reset Password**.
2. Set the subject to `Reset your StarKid Command password`.
3. Replace the template body with the contents of `reset-password.html` and save.

This template also uses Supabase's `{{ .ConfirmationURL }}` variable. Before enabling a public "Forgot password" action, connect its `redirectTo` value to a dedicated password-update screen. The current web confirmation callback is designed for email confirmation, not for choosing a new password.

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
