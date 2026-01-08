export const NEWS_FEEDS = [
  {
    name: 'NASA',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'agency',
  },
  {
    name: 'ESA',
    url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',
    category: 'agency',
  },
  {
    name: 'SpaceX',
    url: 'https://www.spacex.com/api/v1/feed',
    category: 'company',
  },
  {
    name: 'Space.com',
    url: 'https://www.space.com/feeds/all',
    category: 'media',
  },
  {
    name: 'Ars Technica Space',
    url: 'https://feeds.arstechnica.com/arstechnica/science',
    category: 'media',
  },
  {
    name: 'Spaceflight Now',
    url: 'https://spaceflightnow.com/feed/',
    category: 'media',
  },
]

export const NEWS_CATEGORIES = [
  { id: 'all', label: 'All Sources' },
  { id: 'agency', label: 'Space Agencies' },
  { id: 'company', label: 'Companies' },
  { id: 'media', label: 'News Media' },
]
