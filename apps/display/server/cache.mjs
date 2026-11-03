import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { getSkyEvents } from '../../../packages/core/src/domain/skyEvents/skyEvents.js';
import { feeds, observationTime } from '../src/feeds.js';
/** One gateway process owns this cache. All monitors use that shared process. */
export class FeedCache {
    constructor({ definitions = feeds, fetcher = fetch, clock = Date.now, random = Math.random, directory = null, skyUrl = null } = {}) {
        Object.assign(this, { definitions, fetcher, clock, random, directory, skyUrl });
        if (!skyUrl && this.definitions.sky)
            this.definitions = { ...definitions, sky: { ...definitions.sky, source: 'StarKid recurring sky calendar · approximate dates', kind: 'reference' } };
        this.entries = new Map();
        this.inflight = new Map();
        this.retry = new Map();
        this.hostQueues = new Map();
    }
    async restore() {
        if (!this.directory)
            return;
        await Promise.all(Object.entries(this.definitions).map(async ([key, def]) => {
            try {
                const saved = JSON.parse(await readFile(path.join(this.directory, key + '.json'), 'utf8'));
                if (saved.source === def.source && saved.data && def.valid(saved.data) && Number.isFinite(saved.received) && saved.received <= this.clock() + 60000 && this.clock() - saved.received < 30 * 86400000)
                    this.entries.set(key, { ...saved, failed: true });
            }
            catch { /* Empty, evicted, or corrupt cache: normal first-run state. */ }
        }));
    }
    envelope(key) {
        const def = this.definitions[key], item = this.entries.get(key);
        return { source: def.source, kind: def.kind, units: def.units, observedAt: null, received: null, expiresAt: null, data: null, ...item,
            status: !item ? 'unavailable' : item.failed || this.clock() > item.expiresAt ? 'stale' : 'current',
            failed: !item || !!item.failed, reason: this.retry.get(key)?.reason };
    }
    async persist(key, value) {
        if (!this.directory)
            return;
        try {
            await mkdir(this.directory, { recursive: true });
            const file = path.join(this.directory, key + '.json');
            await writeFile(file + '.tmp', JSON.stringify(value), { mode: 0o600 });
            await rename(file + '.tmp', file);
        }
        catch { /* Memory cache still works if disk is unavailable. */ }
    }
    async refresh(key) {
        if (this.inflight.has(key))
            return this.inflight.get(key);
        const existing = this.entries.get(key), now = this.clock();
        if ((existing && !existing.failed && now < existing.expiresAt) || now < (this.retry.get(key)?.next || 0))
            return this.envelope(key);
        const job = this.fetchOne(key).finally(() => this.inflight.delete(key));
        this.inflight.set(key, job);
        return job;
    }
    async fetchOne(key) {
        const def = this.definitions[key], url = key === 'sky' ? this.skyUrl : def.url();
        if (!url && key !== 'sky') {
            this.retry.set(key, { next: this.clock() + 900000, attempt: 0, reason: 'Configure DISPLAY_SKY_EVENTS_URL to connect the existing StarKid sky-event service.' });
            return this.envelope(key);
        }
        const host = url ? new URL(url).host : 'local-calendar';
        // Serialize requests per provider with >=1.1 s spacing (ISS limit: roughly 1/s).
        const previous = this.hostQueues.get(host) || Promise.resolve();
        let release;
        const finished = new Promise(resolve => { release = resolve; });
        this.hostQueues.set(host, finished);
        await previous;
        try {
            const response = key === 'sky' && !url ? new Response(JSON.stringify({ success: true, events: (await getSkyEvents({ start: new Date(this.clock()), days: 60 })).map(e => ({ title: e.title, event_time_utc: e.start, description: e.description })) })) : await this.fetcher(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'StarKid-Mission-Control-Live/1.0', 'Accept': 'application/json' } });
            if (!response.ok)
                throw Error(`Provider HTTP ${response.status}`);
            const content = await response.text();
            if (content.length > 2000000)
                throw Error('Provider response exceeds limit');
            const payload = JSON.parse(content);
            if (!def.valid(payload))
                throw Error('Provider schema validation failed');
            const received = this.clock(), entry = { data: payload, source: def.source, kind: def.kind, units: def.units, received, expiresAt: received + def.ttl, observedAt: observationTime(key, payload), failed: false };
            this.entries.set(key, entry);
            this.retry.delete(key);
            await this.persist(key, entry);
        }
        catch (error) {
            const attempt = Math.min(6, (this.retry.get(key)?.attempt || 0) + 1), delay = Math.min(300000, 15000 * 2 ** attempt) * (0.8 + this.random() * .2);
            this.retry.set(key, { attempt, next: this.clock() + delay, reason: error.name === 'TimeoutError' ? 'Provider timed out' : String(error.message).slice(0, 160) });
            const old = this.entries.get(key);
            if (old)
                this.entries.set(key, { ...old, failed: true });
        }
        finally {
            setTimeout(release, 1100);
        }
        return this.envelope(key);
    }
    async snapshot() {
        const work = Promise.all(Object.keys(this.definitions).map(key => this.refresh(key)));
        let timeout;
        await Promise.race([work, new Promise(resolve => { timeout = setTimeout(resolve, 500); })]);
        clearTimeout(timeout);
        const entries = Object.fromEntries(Object.keys(this.definitions).map(key => [key, this.envelope(key)]));
        const statuses = Object.values(entries).map(e => e.status);
        return { serverTime: this.clock(), feeds: entries, health: statuses.every(s => s === 'current') ? 'current' : statuses.every(s => s === 'unavailable') ? 'unavailable' : 'partial' };
    }
}
