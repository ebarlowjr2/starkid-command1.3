const YOUTUBE_CHANNELS = [
  {
    id: 'nasa',
    name: 'NASA',
    handle: '@NASA',
    channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
    url: 'https://www.youtube.com/@NASA',
    focus: 'agency',
    priority: 1,
    description: 'Official NASA channel featuring launches, ISS activities, and mission coverage.',
  },
  {
    id: 'spacex',
    name: 'SpaceX',
    handle: '@SpaceX',
    channelId: 'UCtI0Hodo5o5dUb67FeUjDeA',
    url: 'https://www.youtube.com/@SpaceX',
    focus: 'launch',
    priority: 2,
    description: 'Official SpaceX channel with Falcon 9, Starship, and Dragon mission streams.',
  },
  {
    id: 'everyday-astronaut',
    name: 'Everyday Astronaut',
    handle: '@EverydayAstronaut',
    channelId: 'UC6uKrU_WqJ1R2HMTY3LIx5Q',
    url: 'https://www.youtube.com/@EverydayAstronaut',
    focus: 'creator',
    priority: 3,
    description: 'Making space exploration accessible through in-depth coverage of launches and rocket science.',
  },
  {
    id: 'nasaspaceflight',
    name: 'NASASpaceflight (NSF)',
    handle: '@NASASpaceflight',
    channelId: 'UCSUu1lih2RifWkKtDOJdsBA',
    url: 'https://www.youtube.com/channel/UCSUu1lih2RifWkKtDOJdsBA',
    focus: 'launch',
    priority: 4,
    description: 'Comprehensive coverage of spaceflight news, launches, and Starbase activities.',
  },
  {
    id: 'pbs-space-time',
    name: 'PBS Space Time',
    handle: '@pbsspacetime',
    channelId: 'UC7_gcs09iThXybpVgjHZ_7g',
    url: 'https://www.youtube.com/@pbsspacetime',
    focus: 'science',
    priority: 5,
    description: 'Deep dives into astrophysics, cosmology, and the nature of the universe.',
  },
  {
    id: 'scott-manley',
    name: 'Scott Manley',
    handle: '@ScottManley',
    channelId: 'UCxzC4EngIsMrPmbm6Nxvb-A',
    url: 'https://www.youtube.com/@scottmanley',
    focus: 'science',
    priority: 6,
    description: 'Space science and rocket engineering explained with expertise and humor.',
  },
  {
    id: 'esa',
    name: 'European Space Agency (ESA)',
    handle: '@esa',
    channelId: 'UCIBaDdAbGlFDeS33shmlD0A',
    url: 'https://www.youtube.com/@europeanspaceagency',
    focus: 'agency',
    priority: 7,
    description: 'Official ESA channel with mission updates, science, and exploration.',
  },
  {
    id: 'rocket-lab',
    name: 'Rocket Lab',
    handle: '@RocketLab',
    channelId: 'UCsWq7LZaizhIi-c-Yo_bcpw',
    url: 'https://www.youtube.com/channel/UCsWq7LZaizhIi-c-Yo_bcpw',
    focus: 'industry',
    priority: 8,
    description: 'Electron rocket launches and Neutron development updates.',
  },
  {
    id: 'fraser-cain',
    name: 'Fraser Cain (Universe Today)',
    handle: '@frasercain',
    channelId: 'UCogrSQkBJn1KF0N9I4oM7eQ',
    url: 'https://www.youtube.com/@frasercain',
    focus: 'science',
    priority: 9,
    description: 'Space news and astronomy explained by Universe Today founder.',
  },
  {
    id: 'spaceflight-now',
    name: 'Spaceflight Now',
    handle: '@SpaceflightNowVideo',
    channelId: 'UCoLdERT4-TJ82PJOHSrsZLQ',
    url: 'https://www.youtube.com/channel/UCoLdERT4-TJ82PJOHSrsZLQ',
    focus: 'launch',
    priority: 10,
    description: 'Launch coverage and spaceflight news from Spaceflight Now.',
  },
  {
    id: 'wn-space',
    name: 'WN Space',
    handle: '@WN-Space',
    channelId: 'UCwn4fIhTNrvJLXJlgTLo-aQ',
    url: 'https://www.youtube.com/@WN-Space',
    focus: 'launch',
    priority: 11,
    description: 'Space news and launch coverage.',
  },
  {
    id: 'what-about-it',
    name: 'What about it!?',
    handle: '@Whataboutit',
    channelId: 'UCbBx6rf_MzVv3wKUyxdPGXg',
    url: 'https://www.youtube.com/@Whataboutit',
    focus: 'creator',
    priority: 12,
    description: 'SpaceX and space industry news and analysis.',
  },
]

let cachedLiveStatus = null
let cacheTime = 0
const CACHE_DURATION = 60 * 1000

async function checkChannelLive(channel, apiKey) {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channelId}&eventType=live&type=video&key=${apiKey}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (!searchResponse.ok) {
      console.error(`YouTube API error for ${channel.name}: ${searchResponse.status}`, searchData)
      return {
        ...channel,
        isLive: false,
        liveVideoId: null,
        liveTitle: null,
        liveUrl: null,
        thumbnail: null,
        startedAt: null,
        apiError: searchData.error?.message || `HTTP ${searchResponse.status}`,
      }
    }
    
    if (!searchData.items || searchData.items.length === 0) {
      return {
        ...channel,
        isLive: false,
        liveVideoId: null,
        liveTitle: null,
        liveUrl: null,
        thumbnail: null,
        startedAt: null,
      }
    }

    const liveVideo = searchData.items[0]
    const videoId = liveVideo.id.videoId

    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${apiKey}`
    const videoResponse = await fetch(videoUrl)
    
    if (!videoResponse.ok) {
      return {
        ...channel,
        isLive: true,
        liveVideoId: videoId,
        liveTitle: liveVideo.snippet.title,
        liveUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: liveVideo.snippet.thumbnails?.high?.url || liveVideo.snippet.thumbnails?.default?.url,
        startedAt: null,
      }
    }

    const videoData = await videoResponse.json()
    const videoDetails = videoData.items?.[0]

    return {
      ...channel,
      isLive: true,
      liveVideoId: videoId,
      liveTitle: videoDetails?.snippet?.title || liveVideo.snippet.title,
      liveUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: videoDetails?.snippet?.thumbnails?.high?.url || liveVideo.snippet.thumbnails?.high?.url,
      startedAt: videoDetails?.liveStreamingDetails?.actualStartTime || null,
    }
  } catch (e) {
    console.error(`Error checking ${channel.name}:`, e.message)
    return {
      ...channel,
      isLive: false,
      liveVideoId: null,
      liveTitle: null,
      liveUrl: null,
      thumbnail: null,
      startedAt: null,
    }
  }
}

function getSampleChannels() {
  return YOUTUBE_CHANNELS.map((channel) => ({
    ...channel,
    isLive: false,
    liveVideoId: null,
    liveTitle: null,
    liveUrl: null,
    thumbnail: null,
    startedAt: null,
  }))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      res.status(200).json({
        checkedAt: new Date().toISOString(),
        channels: getSampleChannels(),
        apiConfigured: false,
        message: 'YouTube API key not configured. Showing channel list without live status.',
      })
      return
    }

    const now = Date.now()
    
    if (cachedLiveStatus && now - cacheTime < CACHE_DURATION) {
      res.status(200).json({
        checkedAt: new Date(cacheTime).toISOString(),
        channels: cachedLiveStatus,
        cached: true,
        apiConfigured: true,
      })
      return
    }

    const channelPromises = YOUTUBE_CHANNELS.map((channel) => 
      checkChannelLive(channel, apiKey)
    )
    
    const channels = await Promise.all(channelPromises)

    cachedLiveStatus = channels
    cacheTime = now

    res.status(200).json({
      checkedAt: new Date(now).toISOString(),
      channels,
      cached: false,
      apiConfigured: true,
    })
  } catch (e) {
    console.error('YouTube Live API error:', e)
    res.status(200).json({
      checkedAt: new Date().toISOString(),
      channels: getSampleChannels(),
      error: 'Failed to check live status',
      apiConfigured: false,
    })
  }
}
