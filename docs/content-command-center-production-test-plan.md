# Content Command Center Production Test Plan

Use the deployed Vercel environment for this test. Do not add or depend on a local Express API server.

## Environment

Confirm these Vercel environment variables are configured before testing:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CONTENT_AUTOMATION_WEBHOOK_URL`
- `CONTENT_AUTOMATION_WEBHOOK_SECRET`

If Buffer is not connected yet, point `CONTENT_AUTOMATION_WEBHOOK_URL` at a temporary Make, Zapier, n8n, or webhook testing endpoint that receives and logs payloads.

## Checklist

1. Deploy latest build to Vercel.
2. Confirm Supabase migration `008_create_content_command_center.sql` is applied.
   Also confirm `009_add_content_test_mode.sql` is applied for production smoke-test safety.
3. Confirm required Vercel env vars are configured.
4. Open `/admin/content`.
5. Create or seed TEST SpaceX Update.
6. Confirm SpaceX update is auto-approved.
7. Generate social pack.
8. Send to webhook.
9. Confirm webhook payload is stored in `content_webhook_events`.
10. Confirm content status becomes `sent_to_buffer`.
11. Create or seed TEST Random Space Fact.
12. Confirm status is `needs_review`.
13. Attempt Send to Buffer before approval.
14. Confirm action is blocked.
15. Approve Random Space Fact.
16. Generate social pack.
17. Send to webhook.
18. Confirm status becomes `sent_to_buffer`.
19. Temporarily disable or break `CONTENT_AUTOMATION_WEBHOOK_URL`.
20. Send another approved test item.
21. Confirm status becomes `failed`.
22. Restore webhook URL.
23. Retry webhook.
24. Confirm retry succeeds.
25. Confirm test items are clearly marked TEST CONTENT.
26. Confirm test items do not appear publicly unless intentionally published.

## Test Routes

- `/admin/content`
- `/admin/content/review`
- `/admin/content/social-queue`
- `/admin/content/published`

## Expected Workflow

```txt
Create test content
        ↓
Apply approval rules
        ↓
Generate social captions
        ↓
Approve if required
        ↓
Send to webhook
        ↓
Store webhook response
        ↓
Retry failed webhook
```
