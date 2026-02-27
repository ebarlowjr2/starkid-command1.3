# StarKid Command

**StarKid Command is a live mission-control interface for tracking, understanding, and exploring space — built for enthusiasts and learners alike.**

A LCARS/Star Trek-inspired mission console for space exploration.

## Quickstart
```bash
corepack enable
corepack prepare pnpm@9.12.2 --activate
pnpm install
pnpm dev
```

### Tailwind setup
Already configured (see `apps/web/tailwind.config.js`, `apps/web/postcss.config.js`, `apps/web/src/index.css`).

### Vercel
Set **Root Directory** to `apps/web`. Keep `vercel.json` at the repo root so `/api/*` functions still deploy.

### Environment
Copy `.env.example` to `.env` and set `VITE_NASA_API_KEY`. You can use `DEMO_KEY` for light testing.

### APIs used
- NASA APOD, NeoWs, DONKI
- SpaceX public API
```
