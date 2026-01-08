const YOUTUBE_CHANNELS = [
  {
    name: 'Everyday Astronaut',
    channelId: 'UC6uKrU_WqJ1R2HMTY3LIx5Q',
    handle: '@EverydayAstronaut',
    description: 'Making space exploration accessible through in-depth coverage of launches and rocket science.',
  },
  {
    name: 'NASA',
    channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
    handle: '@NASA',
    description: 'Official NASA channel featuring launches, ISS activities, and mission coverage.',
  },
  {
    name: 'SpaceX',
    channelId: 'UCtI0Hodo5o5dUb67FeUjDeA',
    handle: '@SpaceX',
    description: 'Official SpaceX channel with Falcon 9, Starship, and Dragon mission streams.',
  },
  {
    name: 'Rocket Lab',
    channelId: 'UCsWq7LZaizhIi-c-Yo_bcpw',
    handle: '@RocketLab',
    description: 'Electron rocket launches and Neutron development updates.',
  },
  {
    name: 'NASASpaceflight',
    channelId: 'UCSUu1lih2RifWkKtDOJdsBA',
    handle: '@NASASpaceflight',
    description: 'Comprehensive coverage of spaceflight news, launches, and Starbase activities.',
  },
  {
    name: 'Scott Manley',
    channelId: 'UCxzC4EngIsMrPmbm6Nxvb-A',
    handle: '@scottmanley',
    description: 'Space science and rocket engineering explained with expertise and humor.',
  },
]

let cachedLiveStatus = null
let cacheTime = 0
const CACHE_DURATION = 60 * 1000

async function checkChannelLive(channel, apiKey) {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channelId}&eventType=live&type=video&key=${apiKey}`
    
    const searchResponse = await fetch(searchUrl)
    if (!searchResponse.ok) {
      console.error(`YouTube API error for ${channel.name}: ${searchResponse.status}`)
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

    const searchData = await searchResponse.json()
    
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

module.exports = async (req, res) => {
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
