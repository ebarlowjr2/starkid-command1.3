import { configuration, routes } from './logic.js';
import { setup } from './setup.js';
import './style.css';
let saved = {};
try {
    saved = JSON.parse(localStorage.getItem('display:configuration')) || {};
}
catch { }
const config = configuration(location.search, saved), pathname = location.pathname.replace(/\/$/, '') || '/';
const station = Object.keys(routes).find(key => routes[key] === pathname);
if (station) {
    config.station = station;
    config.broadcast = false;
}
if (pathname === '/broadcast')
    config.broadcast = true;
if (pathname === '/' && !new URLSearchParams(location.search).has('station') && !new URLSearchParams(location.search).has('mode'))
    setup(config);
else if (station || pathname === '/broadcast' || pathname === '/') {
    try {
        localStorage.setItem('display:configuration', JSON.stringify({ ...config, mode: config.broadcast ? 'broadcast' : 'console', stations: config.stations.join(','), kiosk: config.kiosk ? '1' : '0', reducedMotion: config.reducedMotion ? '1' : '0' }));
    }
    catch { }
    const { startConsole } = await import('./console.js');
    startConsole(config);
}
else {
    setup(config);
    document.querySelector('h1').textContent = 'Station not found · choose a console';
}
if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js').catch(() => { });
