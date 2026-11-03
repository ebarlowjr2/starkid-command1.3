# Validation — November 3, 2026

This record supersedes the initial static-only preview validation. The supplied development brief has now been read and used to extend the implementation. Physical commissioning remains pending.

## Completed software checks

| Check | Result / scope |
| --- | --- |
| Display Node tests | 15 tests: cache deduplication across six clients, bounded refresh/backoff, malformed payloads, optional-source timeout isolation, disk restore/corruption, route configuration round-trip, countdown delays/holds/cancellation/uncertain precision/elapsed times, ISS validity, geographic reference cases, light-time units, solar geometry, antimeridian split |
| Display production build | Pass; independent gateway-compatible build with shared Earth/Mars models; Three.js chunk warning remains about 541 KB uncompressed / 138 KB gzip |
| Workspace frozen lock validation | Pass, `pnpm install --lockfile-only --offline --frozen-lockfile`; QR dependency already existed in the workspace, added explicitly to display importer |
| Affected main web build | Pass, `pnpm -C apps/web build`; existing Browserslist-age and bundle-size warnings |
| Shared core regression suite | 83 tests across 17 files pass; expected unconfigured-Supabase warning in profile tests |
| Real provider gateway check | All seven envelopes current at the check: ISS, predicted track, EPIC, launches, space events, NASA Mars archive metadata, shared approximate recurring sky calendar |
| Source labels | EPIC acquisition date differs from retrieval date; Mars metadata dates are not claimed as actual capture times; recurring sky dates explicitly approximate |

The existing root lockfile contained ongoing main-app changes before this work. Those were preserved; only the new display importer and its explicit existing QR dependency were added for this feature.

## Browser environment and tested flows

Browser plugin unavailable. Used the already installed Playwright 1.64.1 with installed Google Chrome and software WebGL; no Playwright dependency was added to application runtime. Tests use the production Node gateway on `http://localhost:4174`, not Vite's development modules.

The flow under test: operator setup → save lab configuration → open each station directly → refresh without losing assignment → observe automatic presentation → interrupt and restore the network.

Verified with deterministic snapshot fixtures:

- `/` shows the operator station chooser; form save updates persistent settings and generated URLs.
- `/earth`, `/orbit`, `/planets/mars`, and `/missions` open directly and retain the correct station after reload. Configured lab time/name appear alongside UTC.
- ISS marker, automatic-follow coordinate display, altitude/speed units, launch site/destination and countdown render from valid fixture payloads.
- Every Mars stage advances: approach, site, archive, science, communication context. A missing published image preserves a labeled useful scene. Presentation-time simulation was installed before app timers; production timings are unchanged.
- `/broadcast?stations=earth,mars&seconds=10&quality=low` rotates using the same renderers and state.
- 1920×1080 station layouts fit the screen, 3840×2160 layout screenshots were inspected, and 390×844 preview has no horizontal overflow.
- Offline direct-route reload works after warm service-worker caching; last-good data is stale and retains its retrieval time. Reconnection refreshes to current.
- Correct page identity, meaningful content, no framework overlay, and no uncaught page exceptions.

Real-provider checks without fixtures also loaded the 1080p Earth scene, EPIC image, shared gateway snapshot, and 4K layout without uncaught exceptions. This was a point-in-time integration check, not a provider uptime guarantee. The optional deployed StarKid `mission_events` URL was not configured, so that override remains untested; the existing repository calendar fallback works and is labeled as reference data.

Screenshots are outside source under `/private/tmp/display-*-v2.png`, `/private/tmp/display-gateway-live.png`, and `/private/tmp/display-gateway-4k.png`. Deterministic fixtures are visibly named `Fixture`; production never substitutes them for live schedules.

## Short smoke soak — completed, not full acceptance

Ran `scripts/soak.mjs` for 2.001 minutes with repeated 15-second station changes and one 15-second network interruption. Output: `/private/tmp/starkid-display-soak-smoke.json`.

- No page exceptions recorded.
- One renderer and at most seven feed entries throughout sampled operation.
- Planet geometries returned to zero on orbit/mission views; the renderer retained its one internal baseline texture.
- Sampled heap ranged about 4.9–32.2 MB; later samples returned to about 4.9–7.0 MB after initial loads and garbage collection. This short interval does not establish a long-term memory plateau.
- Offline status appeared during interruption and current status returned after reconnection.

## Pending checks and external blockers

- **Two-hour browser soak:** not completed in this implementation run. A reproducible 120-minute script is supplied; the two-minute smoke run is not counted as a substitute.
- **24-hour hardware acceptance:** required before unattended commissioning. Mini PC/physical monitors, viewing-distance readability, power loss, kiosk autostart, screen blanking, GPU temperature, and sustained frame rate remain pending.
- **Raspberry Pi 5 8GB:** no physical hardware was tested. Low-quality software behavior is implemented; hardware performance is not certified.
- **OBS/streaming:** Browser Source/Window Capture, hardware encoder selection, stream reconnect, dropped frames, and live delivery were not tested.
- **Container:** Docker CLI exists, but the local Docker daemon is stopped (`Cannot connect to the Docker daemon`). Dockerfile and manual release workflow are supplied; image build/boot remains unverified. No registry or production deployment was changed.
- **Provider disruption:** automated tests inject HTTP 429, invalid schemas and TimeoutError; actual prolonged provider outages, production-origin policies, and simultaneous physical monitors need field validation.
- **Scientific scope:** no local SGP4 propagator or precise current Earth–Mars ephemeris is claimed. ISS estimates have a 45-second precision validity bound. Terrain centering/solar geometry remain approximate reference views.
- **Optional UX paths:** actual related-origin deployment verification, denied/evicted storage, keyboard fullscreen, forced GPU context-loss restoration, and full accessibility review require additional acceptance testing. Local QR SVG generation and invalid-protocol rejection passed a browser/API check. A separate Chrome run with WebGL disabled rendered the static reference fallback without uncaught page exceptions.

See OPERATIONS.md for the remaining procedure and ROADMAP.md for the seven follow-on station groups. No placeholder station is in the default playlist.
