export const stations = ['earth', 'orbit', 'mars', 'mission'];
export const routes = { earth: '/earth', orbit: '/orbit', mars: '/planets/mars', mission: '/missions' };
export function configuration(search, saved = {}) {
    const q = new URLSearchParams(search);
    const get = (key, fallback) => q.has(key) ? q.get(key) : (saved[key] ?? fallback);
    const selected = String(get('stations', stations.join(','))).split(',').filter(s => stations.includes(s));
    let timezone = String(get('timezone', 'America/Chicago'));
    try {
        new Intl.DateTimeFormat('en', { timeZone: timezone });
    }
    catch {
        timezone = 'UTC';
    }
    const coordinate = (key, max) => { const raw = get(key, ''); const n = Number(raw); return raw !== '' && Number.isFinite(n) && Math.abs(n) <= max ? n : null; };
    let relatedBase = String(get('relatedBase', ''));
    try {
        const u = new URL(relatedBase);
        if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash)
            throw Error();
        relatedBase = u.origin;
    }
    catch {
        relatedBase = '';
    }
    return { station: stations.includes(get('station', 'earth')) ? get('station', 'earth') : 'earth', broadcast: get('mode', '') === 'broadcast', stations: selected.length ? [...new Set(selected)] : stations, seconds: Math.min(600, Math.max(10, Number(get('seconds', 60)) || 60)), tourSeconds: Math.min(120, Math.max(20, Number(get('tourSeconds', 30)) || 30)), quality: get('quality', 'high') === 'low' ? 'low' : 'high', kiosk: String(get('kiosk', '0')) === '1', lab: String(get('lab', 'StarKid Space Lab')).replace(/[<>]/g, '').slice(0, 60), timezone, latitude: coordinate('latitude', 90), longitude: coordinate('longitude', 180), reducedMotion: String(get('reducedMotion', '0')) === '1', audio: false, relatedBase };
}
export function configQuery(config) {
    const values = { ...config, stations: config.stations.join(','), mode: config.broadcast ? 'broadcast' : 'console', kiosk: config.kiosk ? '1' : '0', reducedMotion: config.reducedMotion ? '1' : '0' };
    return new URLSearchParams(Object.entries(values).filter(([k, v]) => !['broadcast', 'audio'].includes(k) && v !== null).map(([k, v]) => [k, String(v)])).toString();
}
export function launchState(launch, now = Date.now()) {
    const status = String(launch.status?.name || 'Unconfirmed schedule');
    if (/cancel|scrub|failure|success/i.test(status))
        return { label: status, countdown: false };
    if (/hold/i.test(status))
        return { label: 'On hold · ' + status, countdown: false };
    const date = Date.parse(launch.net);
    if (!Number.isFinite(date))
        return { label: 'Launch date unconfirmed', countdown: false };
    if (date <= now)
        return { label: 'NET elapsed · awaiting schedule update', countdown: false };
    const precision = String(launch.net_precision?.name || '');
    if (/hour|month|quarter|year|day|week/i.test(precision) || /TBD|TBC|to be|unconfirmed/i.test(status))
        return { label: status + ' · ' + (precision || 'time unconfirmed'), countdown: false };
    return { label: status, countdown: true };
}
export function positionUsable(entry, now = Date.now()) { return !!entry?.data && Number.isFinite(entry.data.timestamp) && Math.abs(now - entry.data.timestamp * 1000) <= 45000; }
export function sunPosition(now = new Date()) {
    const start = Date.UTC(now.getUTCFullYear(), 0, 0), day = (now - start) / 86400000;
    return { lat: 23.44 * Math.sin(2 * Math.PI * (day - 80) / 365.2422), lon: 180 - (now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600) * 15 };
}
export function countdown(date, now = Date.now()) {
    const ms = Date.parse(date) - now;
    if (!Number.isFinite(ms) || ms <= 0)
        return 'Awaiting schedule update';
    const s = Math.floor(ms / 1000);
    return `T− ${Math.floor(s / 86400)}d ${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
export function freshness(entry, ttl, now = Date.now()) { return !entry ? 'UNAVAILABLE' : entry.failed || now - entry.received > ttl ? 'CACHED / STALE' : 'CURRENT'; }
export function readCache(storage, key) { try {
    const value = JSON.parse(storage.getItem('display:' + key));
    return value && Number.isFinite(value.received) && value.data ? value : null;
}
catch {
    return null;
} }
export async function request(url, validate, fetcher = fetch) { const r = await fetcher(url, { signal: AbortSignal.timeout(12000) }); if (!r.ok)
    throw Error(`HTTP ${r.status}`); const data = await r.json(); if (!validate(data))
    throw Error('Invalid source response'); return data; }
export function trackSegments(points) { const segments = []; let segment = []; for (const p of points) {
    if (segment.length && Math.abs(p.longitude - segment.at(-1).longitude) > 180) {
        segments.push(segment);
        segment = [];
    }
    segment.push(p);
} if (segment.length)
    segments.push(segment); return segments; }

export function groundPoint(position, centerLongitude=0) {
 const longitude=((position.longitude-centerLongitude+540)%360)-180;
 return {x:(longitude+180)/360*1000,y:(90-position.latitude)/180*500,longitude};
}
export function lightTimeMinutes(distanceKm) {return distanceKm/299792.458/60;}
