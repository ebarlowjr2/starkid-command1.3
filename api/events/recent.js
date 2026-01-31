let eventsCache = [];

const SAMPLE_EVENTS = [
  {
    id: 'sample-artemis-1',
    source: 'NASA (News Releases)',
    sourceUrl: 'https://www.nasa.gov/news-release/',
    title: 'NASA Artemis II Crew Continues Mission Training',
    url: 'https://www.nasa.gov/artemis-ii-training',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'artemis',
    summary: 'The four astronauts selected for the Artemis II mission continue their intensive training program as NASA prepares for humanity\'s return to lunar orbit.',
    type: 'rss',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-sls-2',
    source: 'NASA (Main Feed)',
    sourceUrl: 'https://www.nasa.gov/feed/',
    title: 'SLS Rocket Preparations Advance for Artemis II Launch',
    url: 'https://www.nasa.gov/sls-artemis-ii',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'artemis',
    summary: 'Engineers at Kennedy Space Center continue stacking and testing the Space Launch System rocket ahead of the Artemis II crewed lunar flyby mission.',
    type: 'rss',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-orion-3',
    source: 'NASA (News Releases)',
    sourceUrl: 'https://www.nasa.gov/news-release/',
    title: 'Orion Spacecraft Completes Critical Systems Testing',
    url: 'https://www.nasa.gov/orion-testing',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    category: 'artemis',
    summary: 'The Orion crew module for Artemis II has successfully completed environmental testing, validating its readiness for the upcoming crewed mission.',
    type: 'rss',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-gateway-4',
    source: 'NASA (Main Feed)',
    sourceUrl: 'https://www.nasa.gov/feed/',
    title: 'Gateway Lunar Station Development Progresses',
    url: 'https://www.nasa.gov/gateway-progress',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'official',
    summary: 'International partners continue assembly of Gateway modules that will serve as a staging point for Artemis missions to the lunar surface.',
    type: 'rss',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-iss-5',
    source: 'NASA (Main Feed)',
    sourceUrl: 'https://www.nasa.gov/feed/',
    title: 'ISS Crew Conducts Science Operations',
    url: 'https://www.nasa.gov/iss-science',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    category: 'official',
    summary: 'Expedition crew members aboard the International Space Station continue a busy schedule of scientific research and station maintenance.',
    type: 'rss',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-spacex-6',
    source: 'Spaceflight Now',
    sourceUrl: 'https://spaceflightnow.com/',
    title: 'SpaceX Launches Crew Dragon to ISS',
    url: 'https://spaceflightnow.com/crew-dragon',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    category: 'launch',
    summary: 'A Falcon 9 rocket successfully launched a Crew Dragon spacecraft carrying astronauts to the International Space Station.',
    type: 'rss',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-jwst-7',
    source: 'NASA (News Releases)',
    sourceUrl: 'https://www.nasa.gov/news-release/',
    title: 'James Webb Telescope Captures Stunning New Images',
    url: 'https://www.nasa.gov/jwst-images',
    publishedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    category: 'official',
    summary: 'NASA releases new infrared images from the James Webb Space Telescope revealing unprecedented details of distant galaxies and nebulae.',
    type: 'rss',
    createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-mars-8',
    source: 'NASA (Main Feed)',
    sourceUrl: 'https://www.nasa.gov/feed/',
    title: 'Perseverance Rover Explores New Terrain on Mars',
    url: 'https://www.nasa.gov/perseverance-update',
    publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    category: 'official',
    summary: 'The Mars Perseverance rover continues its exploration of Jezero Crater, collecting samples and searching for signs of ancient microbial life.',
    type: 'rss',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export function updateEventsCache(newEvents) {
  if (newEvents && newEvents.length > 0) {
    const existingIds = new Set(eventsCache.map((e) => e.id));
    const uniqueNew = newEvents.filter((e) => !existingIds.has(e.id));
    eventsCache = [...uniqueNew, ...eventsCache].slice(0, 200);
    eventsCache.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const category = req.query.category;
    const type = req.query.type;

    let events = eventsCache.length > 0 ? eventsCache : SAMPLE_EVENTS;

    if (category) {
      events = events.filter((e) => e.category === category);
    }

    if (type) {
      events = events.filter((e) => e.type === type);
    }

    events = events.slice(0, limit);

    const artemisEvents = events.filter(
      (e) =>
        e.category === 'artemis' ||
        e.title.toLowerCase().includes('artemis') ||
        e.summary.toLowerCase().includes('artemis')
    );

    res.status(200).json({
      success: true,
      events,
      meta: {
        total: events.length,
        artemisCount: artemisEvents.length,
        usingCache: eventsCache.length > 0,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error('Events API error:', e);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: e.message,
    });
  }
}
