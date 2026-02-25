# StarKid Command Mobile (Planned)

This folder is a placeholder for the future Expo app. When DNS/network access is restored, we will scaffold the Expo project and wire it to shared packages.

Planned steps:
1. Create Expo app in `apps/mobile` (TypeScript).
2. Add `@starkid/core` + `@starkid/types` workspace deps.
3. Configure Metro for monorepo workspace resolution.
4. Implement placeholder screens that mirror web routes.
5. Wire shared storage adapter + core config.
6. Verify at least one shared data fetch in mobile.

Next command sequence (once network is available):
1. `pnpm install`
2. `pnpm dev`
