# 24-hour mini-PC and OBS trial

Status: **procedure prepared; physical hardware trial not executed. Raspberry Pi performance remains unverified.** Run on a dedicated validation device and an unlisted/private stream. This does not authorize changing the existing main app, production site, or a live public stream.

## Fixed trial configuration

Use one tested image digest for the entire trial; do not rebuild or change stations mid-baseline. Record mini-PC model, RAM, CPU/GPU and driver, storage/free space, cooling, OS/kernel, Chromium version, OBS version, encoder, display refresh/resolution, Ethernet interface, gateway URL and image digest. Photograph the actual 1080p display from the normal viewing distance. Repeat at 4K only if 4K is intended for installation; a software screenshot does not establish physical readability or performance.

Roles: the mini-PC runs the display gateway and kiosk; a separate broadcast computer runs OBS. A single computer may perform both roles only if measured CPU/GPU/encoder capacity permits it. Both use the same gateway. Set a DHCP reservation and stable lab DNS name. Remote browsers should use HTTPS so offline service-worker behavior is available; localhost is allowed for the mini-PC's own browser. Do not use the temporary review tunnel as the permanent installation address.

Keep a dedicated nonadministrator `starkid` graphical-login account. Enable automatic login for that kiosk account in the desktop's supported settings. Configure firmware “restore on AC power loss” to **Power On**, disable sleep and screen blanking through desktop power settings, and enable NTP. Record:

```sh
uname -a
lscpu
free -h
df -h
timedatectl status
chromium --version
obs --version
```

Use the actual Chromium executable on this OS (`command -v chromium` or `command -v chromium-browser`). Ubuntu's snap location may differ from a Debian package. Do not disable the browser sandbox.

## Gateway boot and restart

Choose the validated image for the actual architecture, not a floating latest tag. The validated x86_64 image is `starkid-display:validation-amd64-20261103`; the arm64 image is `starkid-display:validation-20261103`. The amd64 software run used emulation, so native hardware performance is still pending. To transfer the exact x86_64 artifact from the validation workstation, use `docker save starkid-display:validation-amd64-20261103 -o starkid-display-amd64.tar`, copy that file to the dedicated mini-PC, and have an administrator run `sudo systemctl enable --now docker` followed by `sudo docker load -i starkid-display-amd64.tar` there.

An administrator performs the gateway provisioning below; the graphical kiosk account remains nonadministrator. On an x86_64 mini-PC, after importing the tested image (choose the arm64 tag instead for an arm64 host):

```sh
DISPLAY_TRIAL_IMAGE=starkid-display:validation-amd64-20261103
uname -m
sudo systemctl enable --now docker
sudo docker image inspect "$DISPLAY_TRIAL_IMAGE" --format '{{.Architecture}} {{.Id}}'
sudo docker volume create starkid-display-trial-cache
sudo docker run -d --name starkid-display-trial \
  --restart unless-stopped -p 4174:4174 \
  --log-opt max-size=10m --log-opt max-file=3 \
  -v starkid-display-trial-cache:/data \
  "$DISPLAY_TRIAL_IMAGE"
curl -fsS http://localhost:4174/api/display/health
```

For final commissioning replace the tag with the recorded immutable image digest or retain the exact loaded image ID. Keep the cache volume across restarts. Do not mount the main-app checkout or change its deployment. If using Node instead of Docker, install the supplied `deploy/starkid-display.service` with correct account/paths; do not run both gateways on the same port.

## Supervised kiosk browser

Create `~/.config/systemd/user/starkid-kiosk.service` in the kiosk account, using its actual graphical-session environment and Chromium path. The URL below is localhost because this example browser runs on the gateway mini-PC:

```ini
[Unit]
Description=StarKid validation kiosk
PartOf=graphical-session.target
After=graphical-session.target

[Service]
Type=simple
Environment=PATH=/usr/local/bin:/usr/bin:/bin:/snap/bin
ExecStart=/usr/bin/env chromium --user-data-dir=%h/.config/starkid-trial-browser --kiosk --no-first-run --disable-session-crashed-bubble http://localhost:4174/broadcast?stations=earth,orbit,mars,mission&seconds=120&tourSeconds=20&quality=high&kiosk=1
Restart=always
RestartSec=10
TimeoutStopSec=20

[Install]
WantedBy=graphical-session.target
```

In the logged-in desktop session, import the session variables, then enable the service:

```sh
systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XAUTHORITY DBUS_SESSION_BUS_ADDRESS
systemctl --user daemon-reload
systemctl --user enable --now starkid-kiosk.service
systemctl --user status starkid-kiosk.service
```

Verify that this desktop actually starts `graphical-session.target`. If it does not, use its documented autostart integration to start the user service after graphical login; do not guess DISPLAY values or run the graphical browser as root. Use a dedicated profile to prevent Chromium from handing the URL to another running process and exiting. Confirm automatic launch with a cold reboot before starting the timed trial. A process supervisor detects exit, not every possible renderer hang; add an external watchdog before unattended commissioning if the hardware trial reveals hangs.

## OBS setup and boot behavior

1. Create profile **StarKidTrial**, scene collection **StarKidTrial**, and scene **Broadcast**. Set base/output to 1920×1080 and 30 fps. Add a Browser Source for `https://LAB-GATEWAY/broadcast?stations=earth,orbit,mars,mission&seconds=120&tourSeconds=20&kiosk=1`. If embedded WebGL is unreliable, Window Capture a dedicated Chromium kiosk window. Record which capture path was tested.
2. Leave “Shutdown source when not visible” off and avoid automatic scene-activation refresh if continuous presentation is desired. Keep all audio muted. Verify all five Mars segments and one full eight-minute four-station cycle before recording/streaming.
3. Select a hardware encoder supported by the actual machine (for example NVENC, Quick Sync, or VideoToolbox). Record encoder, bitrate, keyframe interval, and output resolution. Tune only during a separate setup period; freeze them during the baseline trial.
4. Create a second scene **Fallback** with a low-quality Earth source (`/earth?quality=low&kiosk=1`) or a local dated static image if the gateway is unreachable. Assign separate hotkeys for Broadcast and Fallback. Never remove source/freshness labels from live views.
5. Start a private/unlisted stream and record locally to MKV. Use automatic time splitting (for example 60-minute files) and confirm enough disk space before the trial. At 6 Mb/s, 24 hours is roughly 65 GB before overhead; reserve additional space. Keep stream keys in OBS's local secured profile, outside the repo and URLs.
6. After validating the saved profile, the documented launch command can select the saved scene and begin recording: `obs --profile StarKidTrial --collection StarKidTrial --scene Broadcast --startrecording`. Use the OS's graphical autostart/supervision for that command. Add `--startstreaming` only for the explicitly selected private/unlisted test endpoint after credentials have been configured locally. Verify stream auto-reconnect in OBS's advanced settings and prove it with the outage below.

OBS CLI reference: https://obsproject.com/kb/launch-parameters/ . Encoding guidance: https://obsproject.com/kb/encoding-performance-troubleshooting . Record the application's current settings; an encoder name alone is not performance evidence.

## Evidence collection before T+00:00

Create a trial evidence directory on a disk with adequate capacity. Save the immutable image ID, hardware inventory, source snapshot, first screenshots, OBS settings exports without credentials, and UTC start time. Start a one-minute process/memory log using available system tools, e.g. `pidstat -r -u -p ALL 60` to a trial file. Limit OS journals with the administrator's journald policy (for example 200 MB / seven days). The Docker log options above cap the gateway log at about 30 MB. Check disk usage every four hours; the browser profile and recording files must be included.

Keep an event log with UTC timestamp, action, expected behavior, observed recovery time, source status, and screenshot/recording filename. In OBS View → Stats record rendering lag, encoding lag, network-dropped frames, delivered bitrate, and time-to-render separately. Do not combine intentional network drops with baseline rendering/encoding defects. Record CPU/GPU temperature and throttling with the actual vendor/OS tools.

## Exact 24-hour schedule

T+ values start after setup and the first complete playlist cycle. Use UTC in all evidence. The steps with power or network interruption require the physical operator on the dedicated test equipment.

| Offset | Action | Evidence and acceptance |
| --- | --- | --- |
| 00:00–02:00 | Baseline high-quality four-station broadcast, untouched | Screenshot every station, one full cycle recording; no blank scene, no renderer crash; record warm-up memory separately |
| 02:00 | Kill the supervised kiosk process (`systemctl --user kill --kill-whom=all --signal=SIGKILL starkid-kiosk.service`) | Service restarts within 30 s; correct broadcast URL/profile, cached content and source labels return; verify a new browser PID |
| 03:00 | `sudo docker restart starkid-display-trial` | Health and static scene return within 60 s; cache volume persists; no fabricated new observation dates; browsers recover without manual refresh |
| 04:00 | Disconnect only the viewing computer's Ethernet for five minutes; leave gateway online | Warm browser keeps a useful scene; network/cache status is truthful; ISS precise marker disappears after its 45 s validity window; record source retrieval times before/after |
| 04:05 | Restore Ethernet | Browser resumes snapshot requests; usable gateway content returns within 30 s when LAN is available; no negative/stuck countdown; record actual times |
| 06:00 | Disconnect the gateway's upstream Internet for five minutes while retaining lab LAN access where topology allows | Separate provider outage from browser-offline state; each failed source retains last-good retrieval time and becomes stale; optional feeds do not stall other scenes |
| 06:05 | Restore gateway Internet | Fresh observations return within the documented maximum retry interval (allow 5 min + 20 s); archive acquisition dates remain original; record provider blockers separately |
| 08:00 | Move OBS to Fallback; disable one failing station by editing Browser Source to `/broadcast?stations=earth,orbit,mission&seconds=120&kiosk=1` | After taking Broadcast live again, two complete playlists omit Mars; dedicated lab monitors remain assigned; record source properties and recording timestamps |
| 08:15 | Restore normal four-station playlist | All four return without adding placeholders; restore the same tested settings |
| 10:00 | Stop OBS cleanly, then start through its saved autostart/supervised command | Correct profile, scene collection, capture dimensions, audio-mute state and local recording return; private stream reconnect is confirmed, not assumed |
| 12:00 | Physical AC-loss test on the validation mini-PC: interrupt its power for 30 s with a controlled test outlet | Firmware powers it back on; OS login, gateway, kiosk and saved URL restore within 3 min or the documented measured boot budget; no manual login; NTP synchronizes before scientific timing is accepted |
| 12:30 | Warm-cache offline boot: leave gateway's external Internet disconnected during another restart; then restore it after five minutes | Shell/models/text still work after prior warm visit; missing data is labeled; original times preserved; recovery bounded by gateway retry window |
| 14:00 | On the broadcasting computer, interrupt network for two minutes during the private stream | OBS network-dropped frames identified as intentional; local recording/capture continues where possible; restore link and measure private stream reconnection |
| 16:00–24:00 | Uninterrupted steady-state run, no changes | Compare memory/resources at the same station phase, inspect temperature/throttling, disk usage and OBS stats; record the final full cycle |
| 24:00 | Save final screenshots/snapshot, stop trial recording cleanly, export logs | Complete checklist, inventory, UTC duration and defect list; retain evidence before commissioning |

Do not power-cycle the existing production host or a shared lab router as part of this procedure. If a physical test cannot be isolated, record it as pending instead of performing it on unrelated systems.

## Pass criteria and failure handling

- 24 real elapsed hours on the recorded hardware/configuration, with all scheduled interruptions logged. Zero unexplained page/renderer crashes or scenes blank for more than 30 seconds. At least one full playlist immediately before and after every recovery step.
- Browser process/gateway recovery meets the budgets above. Provider recovery may take the bounded five-minute backoff; that delay must be labeled stale, not current. Browser navigator-online alone is not provider health.
- No permanently negative countdowns, unchanged fake-live ISS precision, or newly invented acquisition times. Failed images leave useful reference context.
- Compare phase-matched memory medians after the first hour and during the final eight-hour period. Investigate persistent monotonic growth or a final median above the settled baseline by more than 20%; this is an engineering investigation threshold, not a universal hardware limit. No OS out-of-memory kill, thermal throttle, or growing inactive model/resource counts.
- During the uninterrupted final eight hours target <0.1% rendering/encoding-lag frames, no sustained overload, and zero unexplained network disconnects. Record intentional network outage intervals separately. If the device cannot meet the target, repeat with `quality=low` before changing output resolution or adding content.
- Source labels, UTC/local time, important facts, and countdowns are legible from the actual viewing distance at the intended resolution. A 4K screenshot alone does not pass this criterion.
- If a station fails: take OBS Fallback first, remove only that station ID from the playlist URL, restore Broadcast after readiness, preserve evidence, and file the defect. Do not restart every monitor or change main-app production to hide it.
- Any failed required recovery step blocks unattended commissioning until fixed and retested. Raspberry Pi remains explicitly unverified unless this procedure is separately run and reported on the actual Pi device.
