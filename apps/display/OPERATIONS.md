# Kiosk and broadcast operations

## Lab monitor

Build and deploy the display independently as described in README.md. Provision one URL per monitor. Use a dedicated OS/browser profile so cached data survives browser restarts. Load each station once while online and wait for both models and service worker installation before disconnecting. Inspect the source timestamps; a working clock is not proof of a working upstream provider.

On Raspberry Pi OS Desktop, use Chromium with the low-quality URL. Depending on your installed package, the executable may be `chromium` or `chromium-browser`:

```sh
chromium --kiosk --no-first-run --disable-session-crashed-bubble 'https://YOUR-DISPLAY-HOST/?station=earth&quality=low&kiosk=1'
```

Use a non-root kiosk account. Keep the browser sandbox enabled. Configure the OS's display settings to disable screen blanking and suspend. Use the desktop's supported autostart mechanism to start Chromium after graphical login; kiosk browser startup is separate from starting a local static server. If serving locally, point at `http://localhost:4174` and start the static server before Chromium.

For recovery from a process crash, wrap the browser in this example supervisor script and autostart the script instead of Chromium:

```sh
#!/bin/sh
while true; do
  chromium --kiosk --no-first-run --disable-session-crashed-bubble 'https://YOUR-DISPLAY-HOST/?station=earth&quality=low&kiosk=1'
  sleep 10
done
```

The loop restarts an exited browser; it does not detect a hung process. For production, add an external watchdog or appliance management that can detect a hung renderer, enforce OS updates, and reboot on a maintenance schedule. Use NTP: all countdowns, freshness, and solar lighting depend on a correct system clock. Configure automatic login only on dedicated kiosk devices. Avoid running the app from `file://`.

On initial startup, unavailable APIs leave honest empty states. During outages the last valid observations remain, with stale labels. Once connectivity returns the application reconnects automatically. WebGL context restoration reloads the shell. OS restart, browser restart, network loss, and GPU recovery must all be tested on the actual monitor hardware.

## OBS livestream

1. Add a Browser Source pointed to `https://YOUR-DISPLAY-HOST/?mode=broadcast&seconds=60&kiosk=1`.
2. Set source dimensions to match output, initially 1920×1080, and OBS frame rate to 30 fps. Disable “Shutdown source when not visible” if you want rotation to continue across scenes. Avoid “Refresh browser when scene becomes active” if uninterrupted rotation matters.
3. Verify the source renders both models and all stations through a full four-minute cycle. If OBS's embedded browser lacks usable WebGL, use Window Capture of a dedicated Chromium kiosk window. Test Browser Source caching separately: it uses a different browser profile from Chromium.
4. Keep audio disabled; the display has no soundtrack or microphone permission. Add station-specific overlays in OBS if desired, preserving source and freshness labels.
5. Perform an unlisted/private stream test before broadcasting publicly. Verify NASA/third-party attribution, readable source labels, dates, and mission countdowns at the streamed resolution.

`quality=low` is available for constrained broadcast hosts, but is not a certification for Raspberry Pi OBS encoding. Rendering and video encoding need separate hardware evaluation.

## Acceptance checklist on real equipment

- Run a 24–72 hour soak at intended resolution; record RAM, GPU temperature, CPU, frame rate, throttling, and dropped frames.
- Disconnect/reconnect the network; restart with no network after warm caching; verify timestamps remain original and stale labels appear.
- Power-cycle the device; verify automatic login, browser launch, station URL, display wakefulness, and NTP synchronization.
- Test storage eviction, denied storage, API 429/outage, malformed responses, and service-worker update between releases.
- Exercise GPU context loss/recovery and browser process crash; confirm supervisor/watchdog behavior.
- Check Pi generation, RAM size, OS version, Chromium version, GPU driver, screen resolution, and high/low mode explicitly.
- Test OBS Browser Source and Window Capture, full rotation, stream reconnect, output legibility, and prolonged encoding.
- Verify every live provider from the deployed origin, including CORS and rate limits; public API availability is not guaranteed.

These hardware and livestream checks are pending until executed on the actual deployment equipment.

## Current gateway deployment and mini PC setup

The current release uses one shared Node gateway, not a static-only site. Every lab monitor and the separate OBS computer should use the same gateway origin. Use the Linux service example in `deploy/starkid-display.service` for automatic gateway restart and persistent cache. Install it only after adjusting paths and the dedicated account. Put the gateway behind HTTPS. Use a supported Chromium build on the mini PC, NTP, wired Ethernet, and OS display settings that prevent blanking and suspend. Keep SSH or your existing secured maintenance service available; do not expose a new unauthenticated control plane.

The setup route `/` saves settings and creates direct station URLs. Readiness means the intended scene and its source labels are visible, not merely that the page title loaded. `GET /api/display/health` checks the process, and `/api/display/snapshot` reports per-source state. A partial snapshot is normal when an optional feed is unavailable.

For two monitors under an X11 desktop, use two independent Chromium profiles/windows, e.g. `--user-data-dir="$HOME/.config/starkid-earth" --window-position=0,0 --window-size=1920,1080 --app='https://YOUR-DISPLAY-HOST/earth?kiosk=1'` and another profile at `--window-position=1920,0` with `/orbit?kiosk=1`. Confirm actual display geometry with your desktop settings. Wayland may ignore command-line positioning; assign the windows using the compositor's supported rules. Never share one browser profile concurrently between two processes.

Use OS supervision for production instead of treating the shell loop above as a hang detector. A graphical user service can launch Chromium with `Restart=always`, `RestartSec=10`, and `WantedBy=graphical-session.target`; set its DISPLAY/Wayland session environment through the desktop's supported startup integration. Validate crash recovery in the logged-in graphical session. The system Node gateway service and the graphical browser supervisor are separate processes.

## OBS encoding, fallback, and maintenance

Capture `/broadcast?stations=earth,orbit,mars,mission&seconds=90&kiosk=1` at 1920×1080/30 fps. Wait for the first scene and freshness labels before taking it live. Prefer a supported hardware encoder (NVENC, Quick Sync, or VideoToolbox as appropriate to the broadcast computer); verify hardware-encoding availability in OBS and watch encoder overload/dropped-frame metrics. Encoding on a Raspberry Pi is not certified by low-quality rendering tests.

Create a second OBS scene using `/earth?quality=low&kiosk=1` as the visual fallback. If one station fails, remove its ID from the `/broadcast?stations=...` URL; no code or fleet-wide switch is required. Optional provider failures do not add empty stations to the playlist. Essential station context remains visible even without a source, so a source outage does not silently skip a required console.

Keep stream keys in OBS's secured local profile or the streaming service integration, outside this repository and outside URLs. Do not include them in screenshots, examples, logs, or committed environment files.

Check `journalctl --disk-usage`, available disk space, browser profile size, and the cache directory during maintenance. Limit the gateway journal with your OS journald policy (for example `SystemMaxUse=200M` and `MaxRetentionSec=7day` in an administrator-managed drop-in). The gateway logs startup only and keeps seven bounded snapshot files; the browser keeps up to eight NASA images plus the current app/model cache. Remove retired browser profiles manually after validating backups; never delete an active profile to troubleshoot a feed outage.

## Reproducible two-hour browser soak

`scripts/soak.mjs` runs a repeated playlist, samples browser heap/resource counts every 15 seconds, interrupts the network once, records errors, and writes a JSON result outside the repository. Supply an installed Playwright module and Chrome path if they are not on the standard tooling path:

```sh
cd apps/display
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROME_PATH='/absolute/path/to/chrome' \
SOAK_MINUTES=120 SOAK_OUTPUT=/tmp/starkid-display-soak.json \
node scripts/soak.mjs
```

Use `SOFTWARE_GL=1` only for headless software-rendered checks; it does not measure physical GPU performance. Heap growth across model loads is expected; inspect whether the later samples plateau, whether inactive scene resources are released, and whether the network reconnect returns feeds to their truthful state. A short smoke run is not a two-hour soak. Run the 24-hour hardware checklist before leaving the installation unattended.
