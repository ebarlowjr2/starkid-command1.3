// src/config/liveFeeds.js
// Configuration for live stream feeds - easy to update without code changes

export const LIVE_FEEDS = {
  iss: {
    title: "ISS LIVE",
    subtitle: "SPACE STATION VIEWS",
    description: "NASA official downlink",
    sources: [
      {
        id: "nasa_iss_ustream",
        label: "NASA Stream",
        type: "iframe",
        embedUrl: "https://ustream.tv/embed/17074538",
        fallbackUrl: "https://www.nasa.gov/nasalive"
      },
      {
        id: "nasa_youtube_iss",
        label: "NASA YouTube",
        type: "youtube",
        videoId: "P9C25Un7xaM",
        channelStreamsUrl: "https://www.youtube.com/@NASA/streams"
      }
    ],
    externalLinks: [
      {
        label: "VIEW ON NASA LIVE",
        url: "https://www.nasa.gov/nasalive"
      },
      {
        label: "ISS TRACKER",
        url: "https://spotthestation.nasa.gov/"
      }
    ],
    losMessage: "If you see a blue screen or downtime, the ISS is in a normal Loss of Signal (LOS) period between ground station passes. This is expected and the feed will return when the station regains contact."
  }
}
