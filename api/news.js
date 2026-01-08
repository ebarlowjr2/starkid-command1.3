const NEWS_FEEDS = [
  {
    id: 'nasa-main',
    name: 'NASA (Main Feed)',
    url: 'https://www.nasa.gov/feed/',
    siteUrl: 'https://www.nasa.gov/',
    category: 'official',
    priority: 1,
  },
  {
    id: 'nasa-news-releases',
    name: 'NASA (News Releases)',
    url: 'https://www.nasa.gov/news-release/feed/',
    siteUrl: 'https://www.nasa.gov/news-releases/',
    category: 'official',
    priority: 2,
  },
  {
    id: 'nasa-image-of-the-day',
    name: 'NASA (Image of the Day)',
    url: 'https://www.nasa.gov/feeds/iotd-feed/',
    siteUrl: 'https://www.nasa.gov/multimedia/imagegallery/iotd.html',
    category: 'official',
    priority: 3,
  },
  {
    id: 'esa-space-news',
    name: 'ESA (Space News)',
    url: 'https://www.esa.int/rssfeed/Our_Activities/Space_News',
    siteUrl: 'https://www.esa.int/',
    category: 'official',
    priority: 4,
  },
  {
    id: 'spaceflight-now',
    name: 'Spaceflight Now',
    url: 'https://spaceflightnow.com/feed/',
    siteUrl: 'https://spaceflightnow.com/',
    category: 'launch',
    priority: 5,
  },
  {
    id: 'universe-today',
    name: 'Universe Today',
    url: 'https://www.universetoday.com/feed/',
    siteUrl: 'https://www.universetoday.com/',
    category: 'astronomy',
    priority: 6,
  },
  {
    id: 'skyandtelescope-astronomy-news',
    name: 'Sky & Telescope (Astronomy News)',
    url: 'https://skyandtelescope.org/astronomy-news/rss',
    siteUrl: 'https://skyandtelescope.org/astronomy-news/',
    category: 'astronomy',
    priority: 7,
  },
  {
    id: 'space-com',
    name: 'Space.com',
    url: 'https://www.space.com/feeds.xml',
    siteUrl: 'https://www.space.com/',
    category: 'journalism',
    priority: 8,
  },
  {
    id: 'spaceforce',
    name: 'U.S. Space Force (News)',
    url: 'https://www.spaceforce.mil/RSS/',
    siteUrl: 'https://www.spaceforce.mil/',
    category: 'official',
    priority: 9,
  },
]

let cachedNews = null
let cacheTime = 0
const CACHE_DURATION = 10 * 60 * 1000

function parseRSSItem(item, source, category) {
  const getTagContent = (tag) => {
    const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
    return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : null
  }

  const getAttrContent = (tag, attr) => {
    const match = item.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`))
    return match ? match[1] : null
  }

  const title = getTagContent('title')
  const link = getTagContent('link') || getAttrContent('link', 'href')
  const description = getTagContent('description') || getTagContent('summary')
  const pubDate = getTagContent('pubDate') || getTagContent('published') || getTagContent('dc:date')
  
  let image = getAttrContent('media:content', 'url') || 
              getAttrContent('media:thumbnail', 'url') ||
              getAttrContent('enclosure', 'url')
  
  if (!image) {
    const imgMatch = (description || '').match(/<img[^>]+src="([^"]+)"/)
    if (imgMatch) image = imgMatch[1]
  }

  return {
    title: title || 'Untitled',
    link: link || '#',
    summary: description ? description.replace(/<[^>]+>/g, '').slice(0, 200) + '...' : '',
    publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    source,
    category,
    image,
  }
}

function parseRSS(xml, source, category) {
  const items = []
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || []
  
  for (const item of itemMatches.slice(0, 10)) {
    try {
      items.push(parseRSSItem(item, source, category))
    } catch (e) {
      console.error(`Error parsing item from ${source}:`, e)
    }
  }
  
  return items
}

async function fetchFeed(feed) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StarKid-Command/1.0',
      },
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      console.error(`Failed to fetch ${feed.name}: ${response.status}`)
      return []
    }
    
    const xml = await response.text()
    return parseRSS(xml, feed.name, feed.category)
  } catch (e) {
    console.error(`Error fetching ${feed.name}:`, e.message)
    return []
  }
}

const SAMPLE_NEWS = [
  {
    title: 'NASA Artemis II Crew Prepares for Lunar Mission',
    link: 'https://www.nasa.gov/artemis-ii',
    summary: 'The four astronauts selected for the Artemis II mission continue their training as NASA prepares for humanity\'s return to the Moon...',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'NASA (Main Feed)',
    category: 'official',
    image: null,
  },
  {
    title: 'SpaceX Launches 23 Starlink Satellites to Orbit',
    link: 'https://spaceflightnow.com/spacex-starlink',
    summary: 'A Falcon 9 rocket successfully delivered another batch of Starlink satellites, expanding the global internet constellation...',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: 'Spaceflight Now',
    category: 'launch',
    image: null,
  },
  {
    title: 'ESA\'s Juice Mission Approaches Jupiter System',
    link: 'https://www.esa.int/juice',
    summary: 'The Jupiter Icy Moons Explorer continues its journey to study Ganymede, Callisto, and Europa for signs of habitability...',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: 'ESA (Space News)',
    category: 'official',
    image: null,
  },
  {
    title: 'James Webb Telescope Reveals Ancient Galaxy Formation',
    link: 'https://www.space.com/jwst-discoveries',
    summary: 'New observations from JWST show galaxies forming just 300 million years after the Big Bang, challenging existing models...',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: 'Space.com',
    category: 'journalism',
    image: null,
  },
  {
    title: 'New Exoplanet Discovery in Habitable Zone',
    link: 'https://www.universetoday.com/exoplanet-discovery',
    summary: 'Astronomers announce the discovery of a potentially habitable Earth-sized planet orbiting a nearby red dwarf star...',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    source: 'Universe Today',
    category: 'astronomy',
    image: null,
  },
  {
    title: 'Falcon Heavy Launches National Security Payload',
    link: 'https://spaceflightnow.com/falcon-heavy',
    summary: 'SpaceX\'s heavy-lift rocket successfully delivers classified payload for the U.S. Space Force...',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: 'Spaceflight Now',
    category: 'launch',
    image: null,
  },
  {
    title: 'Mars Perseverance Rover Discovers New Organic Compounds',
    link: 'https://www.nasa.gov/perseverance',
    summary: 'The rover\'s instruments detect complex organic molecules in Jezero Crater rocks, adding to evidence of ancient habitability...',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    source: 'NASA (News Releases)',
    category: 'official',
    image: null,
  },
  {
    title: 'Comet Visible to Naked Eye This Month',
    link: 'https://skyandtelescope.org/comet-visibility',
    summary: 'A bright comet makes its closest approach to Earth, offering skywatchers a rare opportunity for observation...',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    source: 'Sky & Telescope (Astronomy News)',
    category: 'astronomy',
    image: null,
  },
  {
    title: 'ISS Crew Conducts Spacewalk for Station Maintenance',
    link: 'https://www.nasa.gov/iss',
    summary: 'Astronauts complete a 6-hour spacewalk to upgrade power systems and install new scientific equipment on the station...',
    publishedAt: new Date(Date.now() - 42 * 60 * 60 * 1000).toISOString(),
    source: 'NASA (Main Feed)',
    category: 'official',
    image: null,
  },
  {
    title: 'U.S. Space Force Announces New Satellite Program',
    link: 'https://www.spaceforce.mil/news',
    summary: 'The Space Force reveals plans for next-generation space domain awareness satellites to enhance national security...',
    publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    source: 'U.S. Space Force (News)',
    category: 'official',
    image: null,
  },
]

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const now = Date.now()
    
    if (cachedNews && now - cacheTime < CACHE_DURATION) {
      res.status(200).json({
        news: cachedNews,
        cached: true,
        cachedAt: new Date(cacheTime).toISOString(),
      })
      return
    }

    const feedPromises = NEWS_FEEDS.map(fetchFeed)
    const results = await Promise.all(feedPromises)
    const allNews = results.flat()

    if (allNews.length === 0) {
      res.status(200).json({
        news: SAMPLE_NEWS,
        cached: false,
        fallback: true,
        message: 'Using sample data - RSS feeds unavailable',
      })
      return
    }

    allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    cachedNews = allNews
    cacheTime = now

    res.status(200).json({
      news: allNews,
      cached: false,
      fetchedAt: new Date(now).toISOString(),
    })
  } catch (e) {
    console.error('News API error:', e)
    res.status(200).json({
      news: SAMPLE_NEWS,
      cached: false,
      fallback: true,
      error: 'Failed to fetch news feeds',
    })
  }
}
