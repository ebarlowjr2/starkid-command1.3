import { stations, routes, configQuery, configuration } from './logic.js';
export function setup(config) {
    const titles = { earth: 'Earth Operations', orbit: 'Orbital Tracking', mars: 'Mars Exploration', mission: 'Mission Control' };
    document.querySelector('#app').innerHTML = `<header><a class="brand" href="/">✦ <span>STARKID<small>MISSION CONTROL LIVE / OPERATOR SETUP</small></span></a></header><main class="setup"><small>UNATTENDED DISPLAY NETWORK</small><h1>Choose your console</h1><p>Assign a station to each monitor, or launch the broadcast playlist. Settings are saved on this device and included in every generated link.</p><div class="station-chooser">${stations.map(s => `<a data-view="${s}" href="${routes[s]}"><small>DEDICATED CONSOLE</small><h2>${titles[s]}</h2><span>Open station →</span></a>`).join('')}<a data-view="broadcast" href="/broadcast"><small>PUBLIC STREAM</small><h2>Broadcast</h2><span>Automatic playlist →</span></a></div><form id="settings"><h2>Lab configuration</h2><div class="settings-grid"><label>Lab name<input name="lab" maxlength="60"></label><label>Lab time zone<input name="timezone" placeholder="America/Chicago" required></label><label>Latitude (optional)<input name="latitude" type="number" min="-90" max="90" step="any"></label><label>Longitude (optional)<input name="longitude" type="number" min="-180" max="180" step="any"></label><label>Rendering quality<select name="quality"><option value="high">High · mini PC</option><option value="low">Low · Raspberry Pi evaluation</option></select></label><label>Broadcast dwell (seconds)<input name="seconds" type="number" min="10" max="600"></label><label>Tour segment (seconds)<input name="tourSeconds" type="number" min="20" max="120"></label><label>Verified StarKid deployment (optional)<input name="relatedBase" type="url" placeholder="https://your-starkid-site.example"></label><label>Playlist (station IDs, comma-separated)<input name="stations" required></label><label>Motion<select name="reducedMotion"><option value="0">Normal</option><option value="1">Reduced · no camera easing</option></select></label><label>Presentation controls<select name="kiosk"><option value="1">Hide (kiosk)</option><option value="0">Show</option></select></label></div><p>Audio is always muted. Coordinates are configuration context only: no local-pass predictions are promised. Only set a related deployment after verifying its matching StarKid routes work.</p><button type="submit">Save configuration and update links</button><button type="button" id="reset">Reset defaults</button><p id="saved" role="status"></p></form></main>`;
    const form = document.querySelector('#settings');
    function fill(c) { for (const el of form.elements) {
        if (!el.name)
            continue;
        el.value = el.name === 'stations' ? c.stations.join(',') : el.name === 'kiosk' ? (c.kiosk ? '1' : '0') : el.name === 'reducedMotion' ? (c.reducedMotion ? '1' : '0') : c[el.name] ?? '';
    } links(c); }
    function links(c) { document.querySelectorAll('[data-view]').forEach(a => { const view = a.dataset.view; a.href = (view === 'broadcast' ? '/broadcast' : routes[view]) + '?' + configQuery({ ...c, broadcast: view === 'broadcast', station: view === 'broadcast' ? c.station : view }); }); }
    form.onsubmit = e => { e.preventDefault(); const next = configuration(new URLSearchParams(new FormData(form)).toString()); try {
        localStorage.setItem('display:configuration', JSON.stringify({ ...next, stations: next.stations.join(','), kiosk: next.kiosk ? '1' : '0', reducedMotion: next.reducedMotion ? '1' : '0' }));
        document.querySelector('#saved').textContent = 'Configuration saved. Open a station above.';
    }
    catch {
        document.querySelector('#saved').textContent = 'Device storage unavailable. Generated station URLs still preserve these settings.';
    } fill(next); };
    document.querySelector('#reset').onclick = () => { try {
        localStorage.removeItem('display:configuration');
    }
    catch { } fill(configuration('')); document.querySelector('#saved').textContent = 'Default configuration restored.'; };
    fill(config);
}
