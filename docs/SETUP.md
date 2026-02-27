# Setup

## Corepack
```bash
corepack enable
corepack prepare pnpm@9.12.2 --activate
```

## Install
```bash
pnpm install
```

## Run Web App
```bash
pnpm dev
```

## Vercel
- Set **Root Directory** to `apps/web`.
- Keep `vercel.json` at the repo root so `/api/*` functions continue to deploy correctly.
