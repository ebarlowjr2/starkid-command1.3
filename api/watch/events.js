import { createHash } from 'node:crypto';

const OFFICIAL_RSS_FEEDS = [
  {
    id: 'nasa-main',
    name: 'NASA (Main Feed)',
    url: 'https://www.nasa.gov/feed/',
    category: 'official',
    priority: 1,
  },
  {
    id: 'nasa-news-releases',
    name: 'NASA (News Releases)',
    url: 'https://www.nasa.gov/news-release/feed/',
    category: 'official',
    priority: 2,
  },
  {
    id: 'nasa-artemis',
    name: 'NASA Artemis',
    url: 'https://www.nasa.gov/missions/artemis/feed/',
    category: 'artemis',
    priority: 3,
  },
];

const WATCHED_PAGES = [
  {
    id: 'artemis-program',
    name: 'Artemis Program Page',
    url: 'https://www.nasa.gov/humans-in-space/artemis/',
    category: 'artemis',
  },
  {
    id: 'artemis-ii',
    name: 'Artemis II Mission Page',
    url: 'https://www.nasa.gov/mission/artemis-ii/',
    category: 'artemis',
  },
];

let eventsCache = [];
let pageHashes = {};
let lastWatchTime = 0;
const WATCH_COOLDOWN = 5 * 60 * 1000;

function generateHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function generateEventHash(title, url, publishedAt) {
  const content = `${title}|${url}|${publishedAt}`;
  return generateHash(content);
}

function parseRSSItem(item, source, category) {
  const getTagContent = (tag) => {
    const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : null;
  };

  const getAttrContent = (tag, attr) => {
    const match = item.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`));
    return match ? match[1] : null;
  };

  const title = getTagContent('title');
  const link = getTagContent('link') || getAttrContent('link', 'href');
  const description = getTagContent('description') || getTagContent('summary');
  const pubDate = getTagContent('pubDate') || getTagContent('published') || getTagContent('dc:date');

  const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();

  return {
    id: generateEventHash(title, link, publishedAt),
    source,
    sourceUrl: link || '#',
    title: title || 'Untitled',
    url: link || '#',
    publishedAt,
    category,
    summary: description ? description.replace(/<[^>]+>/g, '').slice(0, 300) : '',
    type: 'rss',
    createdAt: new Date().toISOString(),
  };
}

function parseRSS(xml, source, category) {
  const items = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];

  for (const item of itemMatches.slice(0, 15)) {
    try {
      items.push(parseRSSItem(item, source, category));
    } catch (e) {
      console.error(`Error parsing item from ${source}:`, e);
    }
  }

  return items;
}

async function fetchFeed(feed) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StarKid-Command-EventWatcher/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Failed to fetch ${feed.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSS(xml, feed.name, feed.category);
  } catch (e) {
    console.error(`Error fetching ${feed.name}:`, e.message);
    return [];
  }
}

async function checkPageChange(page) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(page.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StarKid-Command-EventWatcher/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Failed to fetch page ${page.name}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const mainContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const newHash = generateHash(mainContent);
    const oldHash = pageHashes[page.id];

    if (oldHash && oldHash !== newHash) {
      pageHashes[page.id] = newHash;
      return {
        id: generateEventHash(page.name, page.url, new Date().toISOString()),
        source: 'Page Monitor',
        sourceUrl: page.url,
        title: `${page.name} Updated`,
        url: page.url,
        publishedAt: new Date().toISOString(),
        category: page.category,
        summary: `The ${page.name} has been updated. Check for new information about ${page.category === 'artemis' ? 'Artemis missions' : 'space missions'}.`,
        type: 'page_change',
        createdAt: new Date().toISOString(),
      };
    }

    pageHashes[page.id] = newHash;
    return null;
  } catch (e) {
    console.error(`Error checking page ${page.name}:`, e.message);
    return null;
  }
}

function dedupeEvents(newEvents, existingEvents) {
  const existingHashes = new Set(existingEvents.map((e) => e.id));
  return newEvents.filter((e) => !existingHashes.has(e.id));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  const isCronJob = authHeader === `Bearer ${cronSecret}` || req.headers['x-vercel-cron'] === '1';
  const isManualTrigger = req.query.manual === 'true' && process.env.NODE_ENV !== 'production';

  if (!isCronJob && !isManualTrigger) {
    const now = Date.now();
    if (now - lastWatchTime < WATCH_COOLDOWN) {
      res.status(200).json({
        success: true,
        message: 'Watch cooldown active',
        nextWatchIn: Math.ceil((WATCH_COOLDOWN - (now - lastWatchTime)) / 1000) + 's',
        eventsCount: eventsCache.length,
      });
      return;
    }
  }

  try {
    lastWatchTime = Date.now();

    const feedPromises = OFFICIAL_RSS_FEEDS.map(fetchFeed);
    const feedResults = await Promise.all(feedPromises);
    const rssEvents = feedResults.flat();

    const pagePromises = WATCHED_PAGES.map(checkPageChange);
    const pageResults = await Promise.all(pagePromises);
    const pageEvents = pageResults.filter(Boolean);

    const allNewEvents = [...rssEvents, ...pageEvents];
    const uniqueNewEvents = dedupeEvents(allNewEvents, eventsCache);

    if (uniqueNewEvents.length > 0) {
      eventsCache = [...uniqueNewEvents, ...eventsCache].slice(0, 200);
    }

    eventsCache.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const artemisEvents = uniqueNewEvents.filter((e) => 
      e.category === 'artemis' || 
      e.title.toLowerCase().includes('artemis') ||
      e.summary.toLowerCase().includes('artemis')
    );

    res.status(200).json({
      success: true,
      watchedAt: new Date().toISOString(),
      stats: {
        rssItemsFound: rssEvents.length,
        pageChangesDetected: pageEvents.length,
        newEventsAdded: uniqueNewEvents.length,
        totalEventsStored: eventsCache.length,
        artemisEventsFound: artemisEvents.length,
      },
      newEvents: uniqueNewEvents.slice(0, 10),
      artemisAlerts: artemisEvents,
    });
  } catch (e) {
    console.error('Event watcher error:', e);
    res.status(500).json({
      success: false,
      error: 'Event watcher failed',
      message: e.message,
    });
  }
}
