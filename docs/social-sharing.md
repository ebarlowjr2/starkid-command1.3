# Social Sharing Preview

StarKid Command's default public sharing preview is defined in `apps/web/index.html` and uses this image:

- `https://www.starkidcommand.com/social/starkid-command-share.png`

The image is `1200 x 630` pixels, which supports Open Graph and X/Twitter large-image cards.

## Verify After Deployment

Social platforms cache previews. After a production deploy, re-scrape the homepage URL with the relevant platform tool:

- Facebook and Instagram: Meta Sharing Debugger
- LinkedIn: Post Inspector
- X: Card Validator or a fresh post draft
- iMessage, Slack, and Discord: send `https://www.starkidcommand.com/` in a new message

If an old preview persists, use the platform's re-scrape action or share a URL with a temporary query string, such as `https://www.starkidcommand.com/?v=1`.

## Route-Specific Previews

Vite serves a single HTML document, so all routes currently share this branded default preview. Route-specific previews for Artemis, learning modules, or news posts would require server-side metadata or prerendering in a future pass.
