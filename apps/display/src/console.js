import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MARS_FACTS } from '../../../packages/core/src/clients/nasa/marsRovers.js';
import { configuration, stations, sunPosition, countdown, freshness, readCache, request, trackSegments } from './logic.js';
import { feeds } from './feeds.js';
import { routes, configQuery, launchState, positionUsable, groundPoint, lightTimeMinutes } from './logic.js';
export function startConsole(config) {
    let clockOffset = 0;
    const clockNow = () => Date.now() + clockOffset;
    const titles = { earth: 'Earth Operations', orbit: 'Orbital Tracking', mars: 'Mars Exploration', mission: 'Mission Control' };
    let lastRenderKey = '', revision = 0;
    let station = config.broadcast ? config.stations[0] : config.station, epoch = Date.now(), tourEpoch = epoch, renderer, scene, camera, globe, light, modelName = '', modelLoading = false;
    const data = {};
    for (const key of Object.keys(feeds)) {
        let cached;
        try {
            cached = readCache(localStorage, key);
        }
        catch { }
        if (cached && feeds[key].valid(cached.data))
            data[key] = { ...cached, failed: true };
    }
    const esc = s => String(s ?? '—').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const time = d => Number.isFinite(Date.parse(d)) ? new Date(d).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : 'Date unconfirmed';
    const stamp = k => `<div class="source">${esc(data[k]?.source || feeds[k].source)} · ${esc(data[k]?.kind || feeds[k].kind)} · ${freshness(data[k], feeds[k].ttl, clockNow())}<br>${data[k] ? `Retrieved ${time(new Date(data[k].received).toISOString())}` : esc(feeds[k].reason || 'Waiting for source · automatic retry')}</div>`;
    const metric = (label, value) => `<div class="metric"><small>${label}</small><strong>${esc(value)}</strong></div>`;
    const regions = [['Pacific Ocean', 0, -160], ['North America', 35, -100], ['South America', -15, -60], ['Africa', 5, 20], ['Asia', 35, 100], ['Australia', -25, 135]];
    const marsTour = [['Olympus Mons', 18.65, 226.2, 'A shield volcano rising about 21.9 km above the Martian reference surface.'], ['Valles Marineris', -14, -59, 'A vast canyon system stretching across the Martian equator.'], ['Gale Crater', -5.4, 137.8, 'Curiosity’s landing region. Explore the record of ancient lakes.'], ['Jezero Crater', 18.4, 77.5, 'Perseverance’s landing region contains an ancient river delta.']];
    document.querySelector('#app').innerHTML = `<header><a class="brand" href="/">✦ <span>STARKID<small>COMMAND / DISPLAY NETWORK</small></span></a><div class="onair">● MISSION CONTROL LIVE</div><div class="clocks"><time id="clock"></time><small id="local-clock"></small></div></header><nav aria-label="Stations">${stations.map((s, i) => `<button data-station="${s}"><small>STATION 0${i + 1}</small>${titles[s]}</button>`).join('')}<button id="broadcast">↻ Broadcast</button><button id="fullscreen" aria-label="Enter fullscreen">⛶</button></nav><main><div class="heading"><div><small id="eyebrow"></small><h1 id="title"></h1></div><div id="connection"></div></div><div class="workspace"><section class="viewport"><div class="view-label" id="view-label"></div><div id="planet"></div><div id="map"></div><div id="surface-image" class="surface-image" hidden></div><div class="crosshair">+</div><div class="view-caption" id="caption"></div></section><aside id="details"></aside></div><section id="lower"></section><div id="next-event" class="next-event"></div></main><footer><span>STARKID COMMAND <b> / </b> EXPLORING TOGETHER</span><span id="rotation"></span><span id="related"></span><span>${config.quality.toUpperCase()} QUALITY · ${esc(config.lab)}</span></footer>`;
    if (config.kiosk)
        document.body.classList.add('kiosk');
    function select(s) { lastRenderKey = ''; station = s; epoch = Date.now(); tourEpoch = epoch; render(); }
    document.querySelectorAll('[data-station]').forEach(b => b.onclick = () => { location.href = routes[b.dataset.station] + '?' + configQuery({ ...config, station: b.dataset.station, broadcast: false }); });
    document.querySelector('#broadcast').onclick = () => { location.href = '/broadcast?' + configQuery({ ...config, broadcast: true }); };
    document.querySelector('#fullscreen').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => { });
    function render() {
        const renderKey = [station, config.broadcast, Math.floor((Date.now() - tourEpoch) / (config.tourSeconds * 1000)), Math.floor(Date.now() / 15000), revision].join(':');
        if (renderKey === lastRenderKey)
            return;
        lastRenderKey = renderKey;
        const tour = Math.floor((Date.now() - tourEpoch) / (config.tourSeconds * 1000)), mars = station === 'mars', region = mars ? marsTour[Math.floor(tour / 5) % marsTour.length] : regions[tour % regions.length];
        document.querySelector('#title').textContent = titles[station];
        document.querySelector('#eyebrow').textContent = `DEEP SPACE NETWORK / ${config.broadcast ? 'BROADCAST' : 'DEDICATED STATION'} / AUTOMATIC TOUR`;
        document.querySelectorAll('[data-station]').forEach(b => b.classList.toggle('active', b.dataset.station === station));
        document.querySelector('#broadcast').classList.toggle('active', config.broadcast);
        document.querySelector('#planet').hidden = station === 'mission' || station === 'orbit';
        document.querySelector('#map').hidden = station !== 'orbit';
        document.querySelector('.crosshair').hidden = station === 'mission';
        document.querySelector('#view-label').textContent = station === 'orbit' ? 'ISS / GROUND TRACK' : station === 'mission' ? 'FLIGHT SCHEDULE / NEXT DEPARTURE' : `${mars ? 'MARS' : 'EARTH'} / ${region[0].toUpperCase()}`;
        document.querySelector('#caption').innerHTML = station === 'mission' ? missionHero() : `<small>${mars ? 'SURFACE RECONNAISSANCE' : 'PLANETARY OBSERVATION'}</small><h2>${station === 'orbit' ? 'International Space Station' : region[0]}</h2><p>${mars ? region[3] : station === 'orbit' ? 'Automatic longitude follow. Marker and track are source-calculated estimates.' : 'Automatic regional tour · approximate solar day/night boundary'}</p><small>${mars ? 'REFERENCE MODEL · NOT LIVE SURFACE IMAGERY' : station === 'orbit' ? 'NO EXTRAPOLATED LIVE POSITION' : 'REFERENCE MODEL · SOLAR LIGHTING CALCULATED FROM UTC'}</small>`;
        document.querySelector('#details').innerHTML = mars ? `<article><small>PLANET PROFILE</small><h2>The red planet</h2><p>Adapted from Visit a Planet. An unattended tour of Mars and its extraordinary terrain.</p>${MARS_FACTS.slice(0, 3).map(f => metric(f.label.replaceAll('_', ' '), f.value)).join('')}<div class="source">Shared StarKid Mars reference facts · not live telemetry</div></article><article><small>OBSERVATION STATUS</small><p>Live weather unavailable. InSight ended operations in 2022. Historical rover images in the main app are archival material.</p></article>` : station === 'orbit' ? orbitDetails() : station === 'mission' ? eventDetails() : earthDetails(region);
        document.querySelector('#lower').innerHTML = station === 'mars' ? `<article><small>EXPEDITION · ${config.tourSeconds} SECONDS PER SEGMENT</small><div class="waypoints">${marsTour.map(r => `<span class="${r === region ? 'selected' : ''}">${r[0]}<small>${r[1]}° / ${r[2]}°</small></span>`).join('')}</div></article>` : station === 'mission' ? launchList() : station === 'orbit' ? `<article><small>GROUND TRACK PROVENANCE</small><p>Time window: −40 to +50 minutes in 10-minute steps. Lines connect samples schematically; they are not precision trajectories or pass predictions.</p>${stamp('track')}</article>` : imagery();
        const image = document.querySelector('.imagery img');
        if (image)
            image.onerror = () => { const replacement = document.createElement('div'); replacement.className = 'image-placeholder'; replacement.textContent = 'IMAGE UNAVAILABLE'; image.replaceWith(replacement); };
        if (mars)
            renderMars(tour, region);
        else
            document.querySelector('#surface-image').hidden = true;
        updateSharedChrome();
        if (station === 'orbit')
            drawMap();
        if (!['earth', 'mars'].includes(station))
            disposeModel();
        if (station === 'earth' || station === 'mars')
            loadModel(mars ? 'mars' : 'earth');
    }
    function earthDetails(r) { const sun = sunPosition(new Date(clockNow())); return `<article><small>REGIONAL TOUR</small><h2>${r[0]}</h2>${metric('TARGET LATITUDE', r[1] + '°')}${metric('TARGET LONGITUDE', r[2] + '°')}${metric('SUBSOLAR LATITUDE', sun.lat.toFixed(1) + '°')}<div class="source">Approximate solar geometry · calculated locally<br>Planet texture is reference imagery</div></article><article><small>OBSERVATION WINDOW</small><p>Our home planet, from orbit. The illuminated hemisphere follows the Sun as Earth turns.</p><div class="signal">● AUTOMATIC TOUR ACTIVE</div></article>`; }
    function orbitDetails() { const usable = positionUsable(data.iss, clockNow()), p = usable ? data.iss?.data : null; const stale = !usable; return `<article><small>${stale ? 'LAST OBSERVATION / STALE' : 'CURRENT ISS ESTIMATE'}</small><h2>NORAD 25544</h2>${metric('LATITUDE', p ? p.latitude.toFixed(3) + '°' : 'Unavailable')}${metric('LONGITUDE', p ? p.longitude.toFixed(3) + '°' : 'Unavailable')}${metric('ALTITUDE', p ? Number(p.altitude).toFixed(1) + ' km' : 'Unavailable')}${metric('VELOCITY', p ? Number(p.velocity).toFixed(0) + ' km/h' : 'Unavailable')}<div class="source">Observation: ${p ? time(new Date(p.timestamp * 1000).toISOString()) : 'unavailable'}</div>${stamp('iss')}</article>`; }
    function upcoming() { return (data.launches?.data.results || []).filter(l => !/cancel|failure|success/i.test(l.status?.name || '')).sort((a, b) => (Date.parse(a.net) || Infinity) - (Date.parse(b.net) || Infinity)); }
    function nextLaunch() { return upcoming().find(l => Date.parse(l.net) > clockNow()) || upcoming()[0]; }
    function missionHero() { const l = nextLaunch(), state = l ? launchState(l, clockNow()) : null; return `<small>NEXT SCHEDULED LAUNCH · ${freshness(data.launches, feeds.launches.ttl)}</small><h2>${esc(l?.name || 'Awaiting launch schedule')}</h2><div class="countdown">${state?.countdown ? countdown(l.net, clockNow()) : esc(state?.label || '— : — : —')}</div><p>${esc(l?.status?.name || 'Source unavailable. Retrying automatically.')}<br>${esc(l?.pad?.name || 'Launch site unconfirmed')} · ${esc(l?.mission?.orbit?.name || l?.mission?.type || 'Destination unconfirmed')}</p><small>${l ? time(l.net) + ' · NET / SUBJECT TO CHANGE' : 'No fabricated countdowns or fallback dates'}${l?.window_start ? ' · WINDOW ' + time(l.window_start) + ' – ' + time(l.window_end) : ''}</small>`; }
    function eventDetails() { const e = combinedEvents(); return `<article><small>UPCOMING SPACE EVENTS</small>${e.length ? e.map(e => `<div class="event"><h3>${esc(e.name)}</h3><small>${e.approximate ? esc(e.date.slice(0, 10)) + ' (approximate date)' : time(e.date)} · ${esc(e.source)}</small></div>`).join('') : '<p>Waiting for a verified event schedule.</p>'}${stamp('events')}${stamp('sky')}</article>`; }
    function launchList() { return `<article><small>LAUNCH QUEUE · DATES SUBJECT TO CHANGE</small><div class="waypoints">${upcoming().slice(0, 4).map(l => `<span>${esc(l.name)}<small>${time(l.net)}<br>${esc(launchState(l, clockNow()).label)}<br>${esc(l.pad?.location?.name || l.pad?.name || 'Site unconfirmed')}<br>${esc(l.mission?.orbit?.name || l.mission?.type || 'Destination unconfirmed')}</small></span>`).join('') || '<p>No upcoming launches available.</p>'}</div>${stamp('launches')}</article>`; }
    function imagery() { const items = data.imagery?.data || [], im = items[Math.floor((Date.now() - tourEpoch) / (config.tourSeconds * 1000)) % Math.max(1, items.length)]; const date = im?.date.slice(0, 10).replaceAll('-', '/'); return `<article class="imagery"><div><small>EARTH OBSERVATION / RECENT AVAILABLE IMAGERY</small><h2>From a million miles away</h2><p>DSCOVR’s Earth Polychromatic Imaging Camera</p><p>${im ? 'Captured ' + time(im.date + 'Z') : 'Imagery unavailable · reference globe remains operational'}</p>${stamp('imagery')}</div>${im ? `<img alt="NASA EPIC Earth observation" src="https://epic.gsfc.nasa.gov/archive/natural/${date}/jpg/${im.image}.jpg" referrerpolicy="no-referrer">` : '<div class="image-placeholder">EPIC<br>AWAITING DOWNLINK</div>'}</article>`; }
    function drawMap() { const pts = data.track && !data.track.failed && clockNow() - data.track.received < 600000 ? data.track.data : [], p = positionUsable(data.iss, clockNow()) ? data.iss.data : null; const center = p?.longitude || 0, project = q => ({ ...q, longitude: ((q.longitude - center + 540) % 360) - 180 }), centered = pts.map(project), point = p ? project(p) : null; const xy = p => `${(groundPoint(p).x).toFixed(1)},${(groundPoint(p).y).toFixed(1)}`; document.querySelector('#map').innerHTML = `<svg viewBox="0 0 1000 500" role="img" aria-label="ISS latitude and longitude ground track"><defs><pattern id="grid" width="83.33" height="83.33" patternUnits="userSpaceOnUse"><path d="M83 0H0V83" fill="none" stroke="#284754"/></pattern></defs><rect width="1000" height="500" fill="url(#grid)"/><text x="10" y="25" fill="#94acb5">90° N</text><text x="10" y="250" fill="#94acb5">EQUATOR</text><text x="10" y="485" fill="#94acb5">90° S · AUTO FOLLOW · CENTER ${center.toFixed(1)}° LONGITUDE</text>${trackSegments(centered).map(s => `<polyline points="${s.map(xy).join(' ')}" fill="none" stroke="#efb773" stroke-width="3"/>`).join('')}${p ? `<circle cx="${xy(point).split(',')[0]}" cy="${xy(point).split(',')[1]}" r="9" fill="#84ece0"/><text x="${Math.min(850, Number(xy(point).split(',')[0]) + 15)}" y="${xy(point).split(',')[1]}" fill="white">ISS</text>` : '<text x="350" y="220" fill="#94acb5">Waiting for orbital observations</text>'}</svg>`; }
    function combinedEvents() {
        const space = (data.events?.data.results || []).map(e => ({ ...e, source: 'Launch Library 2' }));
        const sky = (data.sky?.data.events || []).map(e => ({ name: e.title, date: e.event_time_utc, source: data.sky.kind === 'reference' ? 'StarKid approximate calendar' : 'StarKid mission events', approximate: data.sky.kind === 'reference' }));
        return [...space, ...sky].filter(e => Date.parse(e.date) > clockNow() && !/cancel/i.test(e.status?.name || '')).sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).slice(0, 5);
    }
    function updateSharedChrome() {
        document.querySelector('#clock').textContent=time(new Date(clockNow()).toISOString());
        document.querySelector('#local-clock').textContent=new Intl.DateTimeFormat('en-US',{timeZone:config.timezone,hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(new Date(clockNow()))+' · '+config.lab;
        const entries = [...combinedEvents(), ...upcoming().filter(l => Date.parse(l.net) > clockNow()&&!/hold|scrub/i.test(l.status?.name||'')).map(l => ({ name: l.name, date: l.net, source: 'Launch Library 2 · '+launchState(l,clockNow()).label, approximate:!launchState(l,clockNow()).countdown }))].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
        const next = entries[0];
        document.querySelector('#next-event').textContent = next ? `NEXT EVENT / ${next.name} · ${next.approximate ? next.date.slice(0, 10) + ' (approximate date)' : time(next.date)} · ${next.source}` : 'NEXT EVENT / Schedule unavailable · global view remains operational';
        const related = document.querySelector('#related');
        if (!config.relatedBase) {
            related.textContent = '';
            return;
        }
        const target = config.relatedBase + (station === 'mars' ? '/planets/mars' : station === 'mission' ? '/command' : station === 'orbit' ? '/updates/live' : '/explore');
        if (related.dataset.target === target)
            return;
        related.dataset.target = target;
        related.innerHTML = `<a class="qr-link" href="${esc(target)}" target="_blank" rel="noopener"><img alt="QR link to the related StarKid experience" src="/api/display/qr?url=${encodeURIComponent(target)}"><span>EXPLORE<br>WITH STARKID ↗</span></a>`;
    }
    function renderMars(tour, region) {
        const phase = tour % 5, stages = ['Approach / orbit', 'Site focus', 'Published imagery', 'Science highlight', 'Earth / communications'];
        const imageArea = document.querySelector('#surface-image');
        imageArea.hidden = phase !== 2;
        document.querySelector('#planet').hidden = phase === 2;
        const imageItems = data.marsImages?.data.collection.items || [], item = imageItems[Math.floor(tour / 5) % Math.max(1, imageItems.length)], meta = item?.data?.[0];
        const imageUrl = item?.links?.find(l => l.rel === 'preview' && /^https:\/\/images-assets\.nasa\.gov\//.test(l.href))?.href;
        if (phase === 2) {
            imageArea.innerHTML = imageUrl ? `<img src="${esc(imageUrl)}" alt="${esc(meta.title)}">` : '<div class="fallback">Published image unavailable<br>Reference model and science tour continue.</div>';
            const img = imageArea.querySelector('img');
            if (img)
                img.onerror = () => { imageArea.innerHTML = '<div class="fallback">Published image unavailable · continuing expedition</div>'; };
        }
        const fact = MARS_FACTS[Math.floor(tour / 5) % MARS_FACTS.length];
        const text = phase === 0 ? 'A reference-model approach to our planetary neighbor.' : phase === 1 ? region[3] + ' Target coordinates are approximate; this is not rover navigation.' : phase === 2 ? (meta?.title || 'NASA archive connection unavailable') : phase === 3 ? fact.description : `At a reference distance of 225 million km, light takes about ${lightTimeMinutes(225000000).toFixed(1)} minutes one way. Actual Earth–Mars distance changes; no current ephemeris is connected.`;
        document.querySelector('#view-label').textContent = 'MARS EXPEDITION / ' + stages[phase].toUpperCase();
        document.querySelector('#caption').innerHTML = `<small class="stage-label">${phase + 1} / 5 · ${stages[phase]}</small><h2>${phase === 3 ? esc(fact.value) : phase === 4 ? 'A conversation across space' : esc(region[0])}</h2><p>${esc(text)}</p><small>${phase === 2 ? 'PUBLISHED ARCHIVE · METADATA DATE IS NOT A CONFIRMED CAPTURE TIME' : 'MODELED REFERENCE VIEW · NOT LIVE TELEMETRY'}</small>`;
        document.querySelector('#details').innerHTML = `<article><small>VISIT A PLANET / AUTOMATIC EXPEDITION</small><h2>${esc(stages[phase])}</h2>${phase === 2 ? `<p>${esc(meta?.title || 'Waiting for NASA archive metadata')}</p><p>Metadata date: ${meta ? time(meta.date_created) : 'unavailable'}</p><p>Credits: ${esc(meta?.photographer || meta?.center || 'NASA / JPL-Caltech')}</p><p>Capture time: not supplied as a separate validated field.</p>${stamp('marsImages')}` : `${metric('TARGET LATITUDE', region[1] + '°')}${metric('TARGET LONGITUDE', region[2] + '°')}${metric(fact.label.replaceAll('_', ' '), fact.value)}<div class="source">Shared StarKid Visit a Planet reference facts</div>`}</article><article><small>OBSERVATION STATUS</small><p>No current surface weather is connected. Distance and communication values are illustrative reference calculations, not a current measurement.</p></article>`;
    }
    let pollTimer, polling = false, failures = 0;
    async function poll() {
        if (polling)
            return;
        polling = true;
        clearTimeout(pollTimer);
        const started = Date.now();
        try {
            const snapshot = await request('/api/display/snapshot', d => Number.isFinite(d.serverTime) && d.feeds && Object.entries(feeds).every(([key, f]) => d.feeds[key] && (d.feeds[key].data === null || f.valid(d.feeds[key].data))));
            clockOffset = snapshot.serverTime - (started + Date.now()) / 2;
            for (const key of Object.keys(feeds)) {
                const incoming = snapshot.feeds[key];
                if (incoming.data) {
                    data[key] = { ...incoming, failed: incoming.status !== 'current' };
                    try {
                        localStorage.setItem('display:' + key, JSON.stringify(data[key]));
                    }
                    catch { }
                }
                else if (data[key])
                    data[key].failed = true;
                feeds[key].reason = incoming.reason;
            }
            failures = 0;
        }
        catch {
            failures = Math.min(6, failures + 1);
            for (const entry of Object.values(data))
                entry.failed = true;
        }
        finally {
            polling = false;
            revision++;
            render();
            pollTimer = setTimeout(poll, failures ? Math.min(300000, 5000 * 2 ** failures) * (0.8 + Math.random() * .2) : 5000);
        }
    }
    window.addEventListener('online', poll);
    function disposeModel() { if (!globe)
        return; scene.remove(globe); globe.traverse(o => { o.geometry?.dispose(); for (const m of [o.material].flat().filter(Boolean)) {
        for (const v of Object.values(m))
            if (v?.isTexture)
                v.dispose();
        m.dispose();
    } }); globe = null; modelName = ''; }
    function initScene() { try {
        renderer = new THREE.WebGLRenderer({ antialias: config.quality !== 'low', alpha: true, powerPreference: config.quality === 'low' ? 'low-power' : 'default' });
        renderer.setPixelRatio(config.quality === 'low' ? 1 : Math.min(devicePixelRatio, 1.5));
        document.querySelector('#planet').append(renderer.domElement);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, 1, .01, 100);
        camera.position.z = 3.8;
        scene.add(new THREE.AmbientLight(0xffffff, .15));
        light = new THREE.DirectionalLight(0xffffff, 3);
        scene.add(light);
        renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); document.querySelector('#planet').dataset.error = 'Graphics interrupted · restoring'; });
        renderer.domElement.addEventListener('webglcontextrestored', () => location.reload());
    }
    catch {
        document.querySelector('#planet').innerHTML = '<div class="fallback"><svg viewBox="0 0 240 160" role="img" aria-label="Static planetary reference grid"><circle cx="120" cy="75" r="65" fill="#163d50" stroke="#8ee4d5"/><ellipse cx="120" cy="75" rx="30" ry="65" fill="none" stroke="#658d9f"/><path d="M55 75h130M65 40h110M65 110h110" stroke="#658d9f"/></svg><br>STATIC REFERENCE / 3D unavailable<br>Tour facts and observations remain available.</div>';
    } }
    function loadModel(name) { if (!renderer || modelName === name || modelLoading)
        return; modelLoading = true;document.querySelector('#planet').dataset.error='Loading reference model · regional facts remain available'; new GLTFLoader().load(`/models/${name}.glb`, g => { disposeModel(); globe = g.scene; const box = new THREE.Box3().setFromObject(globe), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()); globe.position.sub(center); const group = new THREE.Group(); group.add(globe); group.scale.setScalar(2 / Math.max(size.x, size.y, size.z)); globe = group; scene.add(globe); modelName = name; modelLoading = false; if (!['earth', 'mars'].includes(station))
        disposeModel(); document.querySelector('#planet').dataset.error = ''; }, progress => { const percent=progress.total?Math.floor(progress.loaded/progress.total*100):null;document.querySelector('#planet').dataset.error='Loading reference model'+(percent===null?'':' · '+percent+'%'); }, () => { modelLoading = false; document.querySelector('#planet').dataset.error = 'Reference model unavailable · retrying'; }); }
    let last = 0;
    function animate(t) {
        requestAnimationFrame(animate);
        if (!renderer || t - last < (config.quality === 'low' || config.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 33) || document.hidden || !['earth', 'mars'].includes(station))
            return;
        last = t;
        const el = document.querySelector('#planet'), w = el.clientWidth, h = el.clientHeight;
        if (!w || !h)
            return;
        if (renderer.domElement.width !== Math.floor(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(h * renderer.getPixelRatio())) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        const mars = station === 'mars', list = mars ? marsTour : regions, r = list[Math.floor((Date.now() - tourEpoch) / (config.tourSeconds * 1000) / (mars ? 5 : 1)) % list.length];
        const phase = Math.floor((Date.now() - tourEpoch) / (config.tourSeconds * 1000)) % 5;
        camera.position.z = mars && phase === 1 ? 2.9 : 3.8;
        if (globe) {
            globe.rotation.y = THREE.MathUtils.lerp(globe.rotation.y, -(r[2] + (mars ? 0 : 165)) * Math.PI / 180, config.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.025);
            globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, r[1] * Math.PI / 180, config.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : .025);
        }
        const sun = sunPosition(new Date(clockNow()));
        if (mars) {
            light.position.set(-3, 2, 3);
        }
        else {
            const lat = sun.lat * Math.PI / 180, lon = (sun.lon + 165) * Math.PI / 180;
            light.position.set(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
            if (globe)
                light.position.applyEuler(globe.rotation);
            light.position.multiplyScalar(5);
        }
        renderer.render(scene, camera);
    }
    window.__starkidDisplayDiagnostics = () => ({ station, tourSeconds: config.tourSeconds, tourElapsed: Date.now() - tourEpoch, model: modelName, geometries: renderer?.info.memory.geometries || 0, textures: renderer?.info.memory.textures || 0, feedCount: Object.keys(data).length, rendererCount: renderer ? 1 : 0, renderFrame: renderer?.info.render.frame || 0, drawingWidth: renderer?.domElement.width || 0, drawingHeight: renderer?.domElement.height || 0, marsPhase: Math.floor((Date.now()-tourEpoch)/(config.tourSeconds*1000))%5 });
    initScene();
    render();
    requestAnimationFrame(animate);
    poll();
    setInterval(() => { const now = Date.now(); if (config.broadcast && now - epoch >= config.seconds * 1000) {
        select(config.stations[(config.stations.indexOf(station) + 1) % config.stations.length]);
    } document.querySelector('#clock').textContent = time(new Date(clockNow()).toISOString()); document.querySelector('#local-clock').textContent = new Intl.DateTimeFormat('en-US', { timeZone: config.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }).format(new Date(clockNow())) + ' · ' + config.lab; const current = Object.values(data).filter(e => !e.failed && clockNow() < e.expiresAt).length; document.querySelector('#connection').textContent = !navigator.onLine ? '○ OFFLINE / CACHED CONTENT' : `${current === Object.keys(feeds).length ? '● CURRENT' : '◐ PARTIAL'} / ${current} OF ${Object.keys(feeds).length} FEEDS`; document.querySelector('#rotation').textContent = config.broadcast ? `NEXT STATION IN ${Math.max(0, config.seconds - Math.floor((now - epoch) / 1000))}s` : 'DEDICATED STATION · CONTINUOUS OPERATION'; render(); const counter = document.querySelector('.countdown'), launch = nextLaunch(); if (counter && launch) {
        const state = launchState(launch, clockNow());
        counter.textContent = state.countdown ? countdown(launch.net, clockNow()) : state.label;
    } }, 1000);
}
