/** @typedef {import('./contracts').FeedEnvelope} FeedEnvelope */
const finite = Number.isFinite;
const dated = value => typeof value === 'string' && finite(Date.parse(value));
export const feeds = {
    iss: { ttl: 15000, source: 'Where the ISS at?', kind: 'estimated', units: 'degrees / km / km/h',
        url: () => 'https://api.wheretheiss.at/v1/satellites/25544',
        valid: d => d && finite(d.latitude) && Math.abs(d.latitude) <= 90 && finite(d.longitude) && Math.abs(d.longitude) <= 180 && finite(d.timestamp) && finite(d.altitude) && finite(d.velocity) },
    track: { ttl: 300000, source: 'Where the ISS at?', kind: 'predicted', units: 'degrees / UTC seconds',
        url: () => `https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${Array.from({ length: 10 }, (_, i) => Math.floor(Date.now() / 1000) + (i - 4) * 600).join(',')}`,
        valid: d => Array.isArray(d) && d.length > 1 && d.length <= 10 && d.every(p => finite(p.latitude) && Math.abs(p.latitude) <= 90 && finite(p.longitude) && Math.abs(p.longitude) <= 180 && finite(p.timestamp)) },
    imagery: { ttl: 3600000, source: 'NASA / DSCOVR EPIC', kind: 'archive', units: 'UTC acquisition time',
        url: () => 'https://epic.gsfc.nasa.gov/api/natural',
        valid: d => Array.isArray(d) && d.length > 0 && d.length <= 100 && d.every(p => /^epic_[a-zA-Z0-9_]+$/.test(p.image) && dated(p.date)) },
    launches: { ttl: 900000, source: 'The Space Devs / Launch Library 2', kind: 'schedule', units: 'UTC NET / launch window',
        url: () => 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=8&mode=detailed',
        valid: d => d && Array.isArray(d.results) && d.results.length <= 20 && d.results.every(p => typeof p.name === 'string' && (p.net == null || dated(p.net))) },
    events: { ttl: 900000, source: 'The Space Devs / Launch Library 2', kind: 'schedule', units: 'UTC event time',
        url: () => `https://ll.thespacedevs.com/2.3.0/events/?limit=5&ordering=date&date__gte=${new Date().toISOString()}`,
        valid: d => d && Array.isArray(d.results) && d.results.length <= 20 && d.results.every(p => typeof p.name === 'string' && dated(p.date)) },
    marsImages: { ttl: 86400000, source: 'NASA Image and Video Library', kind: 'archive', units: 'published metadata date; not a live capture',
        url: () => 'https://images-api.nasa.gov/search?q=Jezero%20Perseverance&media_type=image&page_size=8',
        valid: d => d && Array.isArray(d.collection?.items) && d.collection.items.length <= 20 && d.collection.items.every(p => typeof p.data?.[0]?.title === 'string' && dated(p.data[0].date_created)) },
    sky: { ttl: 900000, source: 'StarKid mission_events', kind: 'schedule', units: 'UTC event time',
        url: () => null,
        valid: d => d?.success === true && Array.isArray(d.events) && d.events.length <= 100 && d.events.every(p => typeof p.title === 'string' && dated(p.event_time_utc)) }
};
export function observationTime(key, data) {
    if (key === 'iss')
        return new Date(data.timestamp * 1000).toISOString();
    if (key === 'imagery')
        return data[0]?.date;
    if (key === 'marsImages')
        return data.collection.items[0]?.data[0]?.date_created;
    return null; // Retrieval time is never substituted for an unknown source issue time.
}
