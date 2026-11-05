# StarKid Command — Mission Control Live

An independently runnable display app and shared data gateway in the existing pnpm workspace. The main web/mobile router, authentication, and deployments are unchanged. Planet models and Mars facts come from the existing Visit a Planet implementation; recurring sky-event reference dates come from the shared core calendar. Launch data uses the same Launch Library provider, retaining full schedule/window/destination fields the current shared normalized adapter drops.

## Run

Requires Node 22+, pnpm 9, and the repository's workspace dependencies:

```sh
pnpm install --frozen-lockfile
pnpm -C apps/display test
pnpm -C apps/display build
pnpm -C apps/display start
```

Open `http://localhost:4174/`. For development use `pnpm -C apps/display dev` instead of start; Vite serves the same gateway middleware and original model files. Start/preview serve the production build. Run only one server on port 4174. `.env.example` documents server configuration. To load an environment file explicitly: from `apps/display`, run `node --env-file=.env.local server/http.mjs`. No provider key is required.

## Direct routes

| Route | Experience |
| --- | --- |
| `/` | Operator setup and station chooser; outside the unattended presentation |
| `/earth` | Regional globe tour, approximate UTC solar lighting, dated EPIC imagery |
| `/orbit` | ISS estimates, automatic longitude follow, sampled source-predicted track |
| `/planets/mars` | Approach, site focus, published imagery, science, communication context |
| `/missions` | Worldwide launches, sites, destinations, schedule windows, space and sky events |
| `/broadcast` | Playlist using exactly the same station renderers and source state |

Legacy `/?station=earth` and `/?mode=broadcast` links still work. Refresh preserves a route's assigned station. Station controls update the URL. The setup form saves nonsecret settings to localStorage and generates reproducible URLs; Reset defaults clears that saved configuration. A stable URL takes precedence over saved values.

## Configuration

| URL setting | Default / validation |
| --- | --- |
| `station` | earth; route takes precedence |
| `lab` | StarKid Space Lab; maximum 60 characters |
| `timezone` | America/Chicago; validated IANA zone, invalid values become UTC |
| `latitude`, `longitude` | optional; valid degree ranges; no local pass promises |
| `quality` | high or low |
| `stations` | earth,orbit,mars,mission; validated playlist, deduplicated |
| `seconds` | 60; broadcast dwell 10–600 seconds |
| `tourSeconds` | 30; tour segment 20–120 seconds |
| `reducedMotion` | 0; 1 disables camera easing; OS reduced-motion preference is also honored |
| `kiosk` | 0; 1 hides navigation |
| `relatedBase` | optional, verified HTTPS StarKid deployment origin; no credentials or query tokens |

Audio is always off. No sound is required to understand any scene. With no verified related deployment configured, QR links are omitted. When configured, the QR points to known matching routes in the StarKid app; verify those routes on that deployment before use. The QR is generated locally; no third-party QR service receives the URL. Never put account tokens or admin credentials in display configuration.

See `config/four-monitor-lab.json` for four console URLs and a separate broadcasting-computer URL. It is a copyable configuration example; the form and URL are the runtime inputs.

## Shared gateway and provenance

All monitors must point to **one gateway deployment**. Browser clients request `/api/display/snapshot` every five seconds; that does not cause a provider request every five seconds. The gateway deduplicates concurrent requests, refreshes each source at its own cadence, spaces provider requests at least 1.1 seconds apart per host, applies 12-second timeouts, validates schema/size, and backs off with jitter (maximum five minutes). A snapshot returns within about half a second with independently available sources while slow sources continue fetching.

Last-good data stays in bounded process memory and one atomically replaced JSON file per feed (maximum seven files, each payload bounded at 2 MB). Set `DISPLAY_CACHE_DIR` to a persistent local volume. A gateway restart restores original retrieval timestamps and marks restored data stale until successfully refreshed. Corrupt and snapshots older than 30 days are ignored. This is a single-process cache: do not scale replicas independently or deploy the API as stateless per-request functions; that would defeat shared rate limiting.

| Feed | Cadence | Data kind and validity |
| --- | --- | --- |
| ISS, Where the ISS at? | 15 seconds | Estimated; precise marker/telemetry hidden after 45 seconds from source timestamp |
| ISS positions | 5 minutes | Predicted −40/+50-minute samples at 10-minute spacing; no local SGP4 claim; stale/failed track hidden |
| NASA EPIC | 1 hour | Archive imagery; capture time separate from fetch time |
| Launch Library 2 launches/events | 15 minutes | Schedules; NET, status and window semantics retained |
| NASA Image Library Mars | 24 hours | Published archive; metadata creation date is not relabeled as capture time |
| Existing StarKid sky events | 15 minutes | `DISPLAY_SKY_EVENTS_URL` uses the current `/api/sky-events` contract; otherwise shared recurring calendar labeled approximate reference dates |

The typed contract in `src/contracts.d.ts` keeps data kind separate from availability. Envelopes retain source, source date when available, retrieval time, expiry, units, and current/stale/unavailable state. The screen also distinguishes partial availability and offline browser state. Unknown provider issue times remain unknown. A gateway clock offset is used for countdowns; synchronize gateway and monitors with NTP. Launch holds, scrubs, cancellations, uncertain precision, missing times, and elapsed NETs never produce a fictitious precise or negative countdown.

Mars communication context is an explicitly illustrative light-time calculation at the existing shared reference distance of 225 million km, not today's Earth–Mars distance. No Horizons/SSD calls are made. Reference globe orientation and waypoints are approximate and unsuitable for rover navigation. Additional satellites were deferred to avoid implying unvalidated local propagation. CelesTrak OMM/SGP4 remains in the roadmap.

References: [ISS API and rate limit](https://wheretheiss.at/w/developer), [EPIC API](https://epic.gsfc.nasa.gov/about/api), [NASA Image Library API](https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf), [Launch Library documentation](https://ll.thespacedevs.com/docs/).

## Independent deployment and promotion

This release supersedes the earlier static-only hosting instructions: the shared cache requires a persistent Node gateway. Build and deploy **only a tested display revision** as a separate service; main-site deployment must not promote it automatically. Dependencies that affect the display include `apps/display/**`, shared Mars facts/storage imports in `packages/core/**`, the shared sky calendar, `apps/web/public/models/planets/**`, `apps/web/package.json` (Vite/Three tooling), root package configuration, patches, and lockfile. Revalidate the affected main web build when these shared dependencies change.

Options:

1. Linux Node service: build the repo, then install `deploy/starkid-display.service`, adjusting account and absolute paths. The service starts only the display gateway. Put server-only environment values in `/etc/starkid-display.env`; enable the service at boot.
2. Container: from the repository root, `docker build -f apps/display/Dockerfile -t starkid-display:TESTED_REVISION .`, then `docker run --restart unless-stopped -p 4174:4174 -v starkid-display-cache:/data starkid-display:TESTED_REVISION`. The Dockerfile-specific ignore file excludes environment files, credentials, and local build/runtime data. Both arm64 and linux/amd64 images have now been built and independently started in validation; exact image IDs and route/cache results are in [first-release acceptance](docs/FIRST-RELEASE-VALIDATION.md). Physical device performance remains pending.

Terminate HTTPS at your existing reverse proxy. Route all paths to the gateway, including `/api/display/*`. Serve at the domain root; subpath deployment is unsupported. The gateway applies no-cache to HTML/service worker and immutable caching to hashed assets. Deploy frontend and gateway from the same revision and restart the service atomically. `/api/display/health` is a lightweight process health check; it is not a declaration that every provider is current. Roll back by restarting the previous tested artifact with the same cache volume.

Do not publish `apps/display/dist` alone to a static host: that omits the gateway. No production project/settings have been changed by this implementation.

### Separate Vercel frontend

The independent Vercel project is `starkid-mission-control-live`, connected to `ebarlowjr2/starkid-command1.3`, branch `codex/display-reliability-20261103`. Set Root Directory to `apps/display`, enable source files outside that directory, select Vite, use Node 22, and set Output Directory to `dist`. The display's own `vercel.json` supplies the build/install commands and station route fallback; it must remain inside `apps/display`. Do not use the repository-root configuration or root `.vercel` link, which belong to the main application. Installing workspace dependencies supplies shared build tools and assets; the build command builds only the display.

This configuration deploys a static frontend with no serverless functions. It does **not** deploy `server/http.mjs` or supply `/api/display/*`. A separate persistent gateway and a same-origin API proxy are still required before accepting Vercel as the live production host. Keep API paths out of the HTML fallback so missing gateway responses cannot masquerade as successful data. Do not replace the shared cache with independent per-request functions. Create a preview deployment and verify the build and station route refreshes before promotion; leave the main Vercel project unchanged.

## Offline and devices

The service worker precaches shell, all hashed chunks, and both models; runtime API responses are excluded so they cannot appear falsely current. Last-good provider snapshots live in browser localStorage as well as the gateway cache. NASA image runtime caching is bounded to eight previously viewed images. First-ever offline startup requires an initial successful online visit; blocked/evicted browser storage may limit offline functionality. A missing image leaves a labeled useful scene.

One renderer is reused, inactive planet resources are disposed, and hidden/nonplanet views do not draw. Low quality uses pixel ratio 1, no antialiasing, a low-power request, and approximately 10 fps; high quality caps ratio at 1.5 and approximately 30 fps. WebGL failure has a lightweight static reference graphic plus textual information. Context restoration triggers targeted reload; no recurring blind reload loop is used.

See [OPERATIONS.md](OPERATIONS.md), [VALIDATION.md](VALIDATION.md), and [ROADMAP.md](ROADMAP.md). The two-hour software soak and independent Docker validation have passed. Physical mini-PC/OBS commissioning, the 24-hour trial and Raspberry Pi performance remain unverified.

Current review package: [first-release evidence and reproduction](docs/FIRST-RELEASE-VALIDATION.md), [source-by-source acceptance](docs/SOURCE-ACCEPTANCE.md), and [exact 24-hour mini-PC/OBS trial](docs/HARDWARE-TRIAL-24H.md).
