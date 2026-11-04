# First-release reliability validation — November 3, 2026

**Software acceptance passed:** the uninterrupted two-hour run, display tests/build, Docker startup/recovery and external staging route/screenshot checks are complete. Physical 24-hour commissioning remains pending. The earlier workstation attempt was invalidated by clamshell sleep; it is retained as evidence, not counted as a two-hour pass. Docker and screenshot checks below are completed software checks.

## Candidate and scope

The main app and production deployment remain unchanged. Validation uses the standalone Node display gateway on port 4174, an isolated Docker runtime on port 4175, and a temporary HTTPS review tunnel. Read-only diagnostic counters were added for render frames and drawing-buffer dimensions. Screenshot inspection found and corrected a 4K map/caption overlap; slow model downloads now show loading progress. No stations were added.

The final candidate's exact compiled hashes are in `final-artifact-manifest.json` in the evidence directory. No application bundle was rebuilt during the final soak. All nine CI-built HTML/service-worker/chunk/model hashes match the frozen local candidate byte for byte (`ci-local-artifact-comparison.json`). Test harnesses and documentation can be updated without changing the served candidate.

## Evidence location and staging

The run writes raw JSON, JSONL console logs, CSV metrics, manifests, and PNGs under the task's `mission-control-validation` evidence directory outside source. `README.md` there links the captures and raw artifacts.

Temporary review URL: https://thee-superior-welcome-larger.trycloudflare.com/

This is a public HTTPS tunnel to the display gateway, not localhost and not a production-site change. It was verified through Cloudflare's edge and by direct-route browser checks. It lasts only while the tunnel and this machine remain running. The original tunnel expired during clamshell sleep and was replaced; this demonstrates why a temporary tunnel is unsuitable for unattended installation. The official client was downloaded to `/private/tmp`, pinned to version 2026.10.7, and checked against its published release digest. The tunnel is not a permanent staging deployment and has no uptime guarantee.

A cold transfer measured about 5.3 MB in 60 seconds. Earth/Mars models may therefore take minutes on a fresh remote visit. The first 30-second capture attempt correctly revealed incomplete models; those captures were rejected as render passes. The corrected harness waits for model readiness before testing refresh and capturing evidence. The final staging run and the renewed-tunnel run rendered both models at both resolutions, passed all eight route/refresh cases, and had no page exceptions or console errors. A separate [external staging CI check](https://github.com/ebarlowjr2/starkid-command1.3/actions/runs/41732982965) passed on a separate Ubuntu x86_64 CI computer at 22:43:18 UTC: all eight direct-route/refresh cases, both models ready, imagery loaded, zero page exceptions, console errors, failed requests or clipping. Its downloaded raw snapshot, eight original PNGs and inspection contact sheets are in `staging-external-ci`.

## Completed Docker checks

- Docker Desktop started successfully; engine 28.3.2 on arm64.
- Image built from the workspace with frozen dependency resolution. One subsequent build hit a registry connect timeout; retry succeeded. The Dockerfile now caches the pinned package-manager layer independently of source changes and uses a build-only pnpm store cache.
- Final image ID: `sha256:2161e42707c575ccd67d97aae1b2ea9f7835b7b6af9e3b698c914fb0bad2308b`.
- Runtime uses UID 1000 (`node`), only its own `/data` volume, no source-checkout bind mount, and no `apps/web` runtime directory. The gateway and compiled display start independently.
- `/earth`, `/orbit`, `/planets/mars`, and `/missions` render and remain correct after browser refresh at 1920×1080 and 3840×2160. Final model readiness is true, with no document overflow or side-panel clipping and no uncaught page errors.
- A validation-container restart recovered the health endpoint and retained the dedicated cache. A second isolated `--network none` container used a copied warm cache: six remote feeds remained present and stale with original retrieval times; the local reference calendar remained usable. A real 62-second browser outage additionally removed stale ISS precision, preserved retrieval time, and restored the marker after reconnection. Offline startup and restart evidence are separate from physical AC-loss acceptance.

Only disposable containers, images and volumes named `starkid-display-...validation...20261103` were used. No existing production container was changed. A separate linux/amd64 image (`sha256:d006835e1c33c3748b49b4e2f7d9b3605c869627dddd52c1768f938af5ec0bc8`) also built and passed all eight direct-route/refresh captures under Docker Desktop emulation. This establishes image portability/startup, not physical mini-PC speed or encoder behavior. The intended mini-PC hardware trial remains pending.

## Screenshot inspection

The final `staging-final`, renewed public-tunnel `staging-renewed`, and `docker-final` capture sets contain each of the four stations at 1080p and 4K. Primary scenes, labels, clocks, attribution, source state and viewport fit were inspected. The corrected 4K orbital labels are separated from the caption. Stale and missing track states are truthful; a source temporarily failing does not imply a blank application.

The screenshots use headless installed Chrome with software WebGL. They demonstrate application rendering/layout, not physical GPU throughput or viewing-distance readability. Exact route/source JSON is saved alongside each set. No fixture schedules were used in these acceptance captures.

## Full two-hour soak — passed and inspected

The workstation attempt began at 20:26:59 UTC. Power-management logs confirm clamshell sleep at 21:20:10 UTC, producing a 2,837.514-second sampling gap with no frame advancement. Its 120 wall-clock minutes cannot certify uninterrupted operation. The summary explicitly rejects continuity even though the original harness did not gate it. The new harness fails any sample gap above 45 seconds; the CI shell preserves failure through `tee` using pipefail.

The replacement run is [GitHub Actions run 41730448831](https://github.com/ebarlowjr2/starkid-command1.3/actions/runs/41730448831), on `codex/display-reliability-20261103`, commit `1c66db2f3b6e6358e17f7609087ef75185ce93db`. The branch is based on the actual remote main and adds only display files, display workflows and the display lockfile importer. Unrelated local commits and dirty main-app work were excluded. No merge or production promotion is performed. Shared Mars facts, sky-calendar modules, model assets and the web dependency manifest were hash-compared with the CI base and match the local candidate.

Configuration: real providers, 1920×1080, high quality, one reused renderer, 120 seconds per station and 20 seconds per Mars segment. Samples every 15 seconds capture JS heap, aggregate browser-process RSS, DOM count, render frames, active station/model, retained geometries/textures, source state and image failures. No mocked clock, forced GC, fabricated feeds or time compression.

A 90-second browser network interruption occurs at approximately 54 minutes. It tests browser-to-gateway recovery, not physical gateway-uplink loss. The separate network-disabled Docker check tests server-side warm-cache startup. The downloaded raw record, continuity, rotations, memory, rendering and errors have now been inspected. CI retained raw evidence even on failure. The original 26.8 MB archive has been downloaded and verified against GitHub’s SHA-256 digest; `ci-archive-verification.json` records the match. Unchanged raw files and derived summaries are also saved locally outside source. The hosted artifact expires November 11, 2026 at 00:26 UTC; retain the local archive or copy it to release storage before that expiry.

### Measured result

- Actual browser run: **2026-11-03 22:25:02.461 UTC → 2026-11-04 00:25:05.069 UTC**, 120.0435 minutes (4:25–6:25 PM Central on November 3). CI conclusion: success.
- **480 samples**, 120 per station, **61 recorded station visits**, approximately 15 complete playlist cycles. All five Mars stages observed. Maximum sample gap **15.844 seconds**, zero gaps over 45 seconds.
- **Zero page exceptions, zero unexpected console errors, zero browser warnings.** Four `ERR_INTERNET_DISCONNECTED` console/request failures occurred inside the deliberate outage; no other failed browser requests were recorded.
- Browser network disabled **23:19:11.409 → 23:20:41.805 UTC**, **90.396 seconds**. Current/7-of-7 browser state was recorded at **23:20:56.840 UTC**, **15.035 seconds after reconnection**. Before/during/after PNGs show useful cached schedules, explicit offline/stale labels and restoration. This is browser-to-gateway recovery; physical upstream restoration remains in the hardware procedure.
- No sampled scene with missing dimensions, broken images, missing planet models after startup, or unexplained 3D render stalls. The Mars published-image stage intentionally pauses the hidden 3D canvas and is excluded from stall detection. Inactive Orbit/Missions views retained zero planet geometries. Resource maxima: **one renderer, one geometry, three textures, seven feeds**.
- Heap range **3.81–7.13 MiB**. Aggregate browser-process RSS **1014.0–1556.4 MiB**, recorded in every sample. RSS includes multiple processes and shared pages; it is not unique physical memory and is not the gateway's memory. This software-WebGL result is substantial memory use, not a Raspberry Pi performance claim.

Settled medians use online samples at minutes 10–40; final medians use minutes 90–120. These are station-matched, not exact subphase-matched, comparisons. All station heap-median changes are below 4%; RSS changes are below 2%. No progressive retained-renderer/model growth was observed. Two hours does not establish a 24-hour plateau.

| Station | Heap median MiB, settled → final | Aggregate browser RSS median MiB, settled → final | RSS change |
| --- | --- | --- | --- |
| Earth | 5.45 → 5.40 | 1496.4 → 1521.0 | 1.64% |
| Orbit | 5.84 → 5.99 | 1489.5 → 1512.1 | 1.52% |
| Mars | 5.06 → 5.21 | 1331.4 → 1355.9 | 1.85% |
| Missions | 5.72 → 5.94 | 1335.1 → 1357.5 | 1.68% |

The CI post-soak route/refresh checks also passed all eight 1080p/4K cases with ready models, loaded imagery, no clipping and no page/console/request errors. The retained original CI summary is `soak-120m.original-ci-summary.json`; the enhanced local summary and CSV are derived from the unchanged downloaded raw JSON. The CI job log records all 15 tests passing and the production display build succeeding. Build tooling emitted a Three.js chunk-size warning and Actions runtime deprecation notices, separate from browser errors.

## Sources and remaining hardware acceptance

See [SOURCE-ACCEPTANCE.md](SOURCE-ACCEPTANCE.md) for the source-by-source table and provider limitations. The deployed StarKid database-event override is not configured; the existing approximate calendar is working and labeled as reference data. No current Mars surface weather or exact Earth–Mars ephemeris is claimed.

See [HARDWARE-TRIAL-24H.md](HARDWARE-TRIAL-24H.md) for the exact mini-PC/OBS trial: firmware power-on, supervised startup, timed browser/gateway crashes, browser and upstream network outages, AC-loss recovery, OBS restart/reconnect, disabling a station, bounded logs/disk, and phase-matched memory/encoding acceptance. Physical 24-hour acceptance is pending. Raspberry Pi performance remains unverified until tested on the actual device.

## Reproduction commands

From repository root:

```sh
pnpm -C apps/display test
pnpm -C apps/display build
pnpm -C apps/display start
```

For a fresh checkout first install the frozen workspace dependencies (`pnpm install --frozen-lockfile --ignore-scripts`) with Node 22 and pnpm 9.12.2. Use a separate clean checkout when reproducing the exact CI revision; do not reinstall or reset an ongoing dirty main-app workspace. The exact CI rerun below performs this setup automatically.

Install optional browser tooling outside the application workspace. `CHROME_PATH` can select an installed Chrome executable; omit it to use the downloaded Chromium. Playwright is validation tooling, not an application runtime dependency.

```sh
npm install --prefix /tmp/starkid-validation-tools --no-audit --no-fund playwright@1.64.1
node /tmp/starkid-validation-tools/node_modules/playwright/cli.js install chromium
```

In a second terminal, with the gateway above running:

```sh
PLAYWRIGHT_MODULE=/tmp/starkid-validation-tools/node_modules/playwright/index.mjs \
SOFTWARE_GL=1 \
SOAK_MINUTES=120 SOAK_QUALITY=high \
SOAK_OUTPUT=/tmp/starkid-soak-120m.json \
SOAK_EVIDENCE_DIR=/tmp/starkid-soak-evidence \
node apps/display/scripts/soak.mjs

node apps/display/scripts/summarize-soak.mjs /tmp/starkid-soak-120m.json

PLAYWRIGHT_MODULE=/tmp/starkid-validation-tools/node_modules/playwright/index.mjs \
SOFTWARE_GL=1 \
DISPLAY_URL=https://YOUR-STAGING-HOST \
MODEL_TIMEOUT_MS=300000 ACCEPTANCE_DIR=/tmp/starkid-screenshots \
node apps/display/scripts/acceptance.mjs
```

Start this optional audit in a separate terminal **before** the soak above. It uses the same gateway and does not make direct provider calls. Summarize it after the soak and sidecar exit:

```sh
node apps/display/scripts/source-audit.mjs http://localhost:4174 \
  /tmp/starkid-sources.jsonl /tmp/starkid-soak-120m.json
node apps/display/scripts/summarize-sources.mjs /tmp/starkid-sources.jsonl
```

Do not set `SOFTWARE_GL=1` for physical GPU benchmarking. The software result cannot certify a mini-PC or Raspberry Pi frame rate.

```sh
docker build --progress=plain -f apps/display/Dockerfile \
  -t starkid-display:validation-20261103 .
docker run -d --name starkid-display-validation-20261103 \
  --restart unless-stopped -p 127.0.0.1:4175:4174 \
  -v starkid-display-validation-cache-20261103:/data \
  starkid-display:validation-20261103
curl -fsS http://localhost:4175/api/display/health
# Run acceptance.mjs with DISPLAY_URL=http://localhost:4175, then:
docker restart starkid-display-validation-20261103
# Repeat acceptance.mjs to test refreshed routes after restart.
```

Use an available container name if repeating the procedure. Keep the cache volume for recovery checks; never remove production resources as cleanup. The image's hardware architecture must match the intended host or be separately built/tested for it.

## Reproduce the isolated CI evidence

The existing run is immutable and uses a separate feature branch. View or download it without merging or deploying:

```sh
gh run view 41730448831 --repo ebarlowjr2/starkid-command1.3
gh run download 41730448831 --repo ebarlowjr2/starkid-command1.3 \
  --name mission-control-validation-41730448831 --dir /tmp/starkid-ci-evidence
# Optional: repeat the exact same tested CI revision for another real two hours:
gh run rerun 41730448831 --repo ebarlowjr2/starkid-command1.3
```

Keep an installation host continuously powered and awake; idle-sleep prevention on a laptop does not guarantee survival of lid-close/clamshell sleep. A two-hour wall-clock span with suspended sampling fails this acceptance.

## Additional Docker and recovery reproduction

Build and start the alternate architecture on a machine with buildx/emulation support. This is a portability check; it is not a physical mini-PC performance measurement:

```sh
docker buildx build --platform linux/amd64 --load --progress=plain \
  -f apps/display/Dockerfile -t starkid-display:validation-amd64-20261103 .
docker run -d --platform linux/amd64 \
  --name starkid-display-amd64-validation-20261103 \
  -p 127.0.0.1:4176:4174 \
  -v starkid-display-amd64-cache-20261103:/data \
  starkid-display:validation-amd64-20261103
# Repeat acceptance.mjs with DISPLAY_URL=http://localhost:4176.
```

To reproduce server-side offline warm-cache boot, first warm only a disposable validation gateway with real providers. Use dedicated validation volume/container names. Stop that validation source briefly to freeze the cache copy, then restart it. Never substitute production names:

```sh
docker stop starkid-display-validation-20261103
docker volume create starkid-display-offline-cache-repro
docker run --rm --network none --user 0 --entrypoint sh \
  -v starkid-display-validation-cache-20261103:/source:ro \
  -v starkid-display-offline-cache-repro:/data \
  starkid-display:validation-20261103 -c 'cp -a /source/. /data/'
docker start starkid-display-validation-20261103
docker run -d --network none --name starkid-display-offline-repro \
  -v starkid-display-offline-cache-repro:/data \
  starkid-display:validation-20261103
docker exec starkid-display-offline-repro node --input-type=module -e \
  'const s=await fetch("http://localhost:4174/api/display/snapshot").then(r=>r.json());console.log(JSON.stringify(s,null,2))' \
  > /tmp/starkid-offline-snapshot.json
```

Expect cached remote envelopes to retain original receipt/acquisition dates and become stale, while the local approximate calendar remains usable. If a feed never warmed successfully it must be unavailable, not invented. For the separately completed browser precision/reconnection check:

```sh
PLAYWRIGHT_MODULE=/tmp/starkid-validation-tools/node_modules/playwright/index.mjs \
SOFTWARE_GL=1 \
DISPLAY_URL=http://localhost:4174 ACCEPTANCE_DIR=/tmp/starkid-offline-browser \
node apps/display/scripts/offline-probe.mjs
```

Download the independent public-preview check:

```sh
gh run download 41732982965 --repo ebarlowjr2/starkid-command1.3 \
  --name mission-control-public-staging-41732982965 --dir /tmp/starkid-public-staging
```

## Reliability-only next iteration

1. Execute the 24-hour mini-PC/OBS procedure, including AC loss, browser/gateway/OBS restart, upstream and viewing-network restoration, actual encoder/load/thermals, and viewing-distance readability. Raspberry Pi is a separate unverified device check.
2. Budget Launch Library requests across all deployments sharing an egress address; add explicit Retry-After handling and validate throttling recovery. Keep one shared gateway instead of independent polling replicas.
3. Replace the temporary tunnel with a separately hosted persistent gateway, stable HTTPS name, supervised boot/restart, bounded logs and monitored cache storage before claiming 24/7 public availability.
4. Complete the remaining denied/evicted-storage and forced WebGL-context-loss recovery checks on the actual installation browser. Keep the current four-station scope until reliability acceptance is complete.
