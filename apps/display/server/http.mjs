import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { FeedCache } from './cache.mjs';
const require = createRequire(import.meta.url);
const QRCode = require('qrcode-terminal/vendor/QRCode');
const root = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
export const cache = new FeedCache({ directory: process.env.DISPLAY_CACHE_DIR || path.resolve('.cache/display'), skyUrl: process.env.DISPLAY_SKY_EVENTS_URL || null });
await cache.restore();
export async function api(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/display/'))
        return next();
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') {
        res.writeHead(405);
        return res.end();
    }
    if (url.pathname === '/api/display/health') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ ok: true, serverTime: Date.now() }));
    }
    if (url.pathname === '/api/display/snapshot') {
        const snapshot = await cache.snapshot();
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(snapshot));
    }
    if (url.pathname === '/api/display/qr') {
        // Links come only from operator configuration; never fetch the URL on the server.
        const destination = url.searchParams.get('url') || '';
        try {
            const u = new URL(destination);
            if (u.protocol !== 'https:' || u.username || u.password || destination.length > 300)
                throw Error();
        }
        catch {
            res.writeHead(400);
            return res.end('Invalid related HTTPS URL');
        }
        const qr = new QRCode(-1, 1);
        qr.addData(destination);
        qr.make();
        const n = qr.getModuleCount(), paths = [];
        for (let y = 0; y < n; y++)
            for (let x = 0; x < n; x++)
                if (qr.isDark(y, x))
                    paths.push(`M${x + 4} ${y + 4}h1v1h-1z`);
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.end(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 8} ${n + 8}" shape-rendering="crispEdges"><path fill="white" d="M0 0h${n + 8}v${n + 8}H0z"/><path d="${paths.join('')}"/></svg>`);
    }
    res.writeHead(404);
    res.end('Unknown display endpoint');
}
export function start(port = Number(process.env.PORT) || 4174) {
    const server = http.createServer(async (req, res) => {
        try {
            await api(req, res, async () => {
                const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname), requested = path.resolve(root, '.' + pathname);
                if (!requested.startsWith(root + path.sep) && requested !== root) {
                    res.writeHead(403);
                    return res.end();
                }
                let file = requested;
                try {
                    if (!(await stat(file)).isFile())
                        file = path.join(root, 'index.html');
                }
                catch {
                    file = path.join(root, 'index.html');
                }
                const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.json': 'application/json' };
                res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('Cache-Control', file.includes(path.sep + 'assets' + path.sep) ? 'public,max-age=31536000,immutable' : 'no-cache');
                createReadStream(file).on('error', () => { if (!res.headersSent)
                    res.writeHead(404); res.end('Build the display first: pnpm -C apps/display build'); }).pipe(res);
            });
        }
        catch {
            if (!res.headersSent)
                res.writeHead(500);
            res.end('Display service unavailable');
        }
    });
    server.listen(port, '0.0.0.0', () => console.log(`StarKid display: http://localhost:${port}`));
    return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
    start();
