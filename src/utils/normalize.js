// src/utils/normalize.js
// Shared normalizers for StarKid Command "Updates" surfaces.
// Works with configs:
// - YOUTUBE_CHANNELS (src/config/youtubeChannels.js)
// - NEWS_FEEDS (src/config/newsFeeds.js)
// - X_ACCOUNTS (src/config/xAccounts.js)

/* ----------------------------- Shared helpers ----------------------------- */

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function safeIsoDate(input) {
  if (!input) return null
  try {
    const d = input instanceof Date ? input : new Date(input)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString()
  } catch {
    return null
  }
}

export function timeAgo(isoOrDate) {
  if (!isoOrDate) return 'Unknown'
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) return 'Unknown'

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`

  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function toHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/**
 * A simple favicon helper you can use for feed/source icons.
 * Uses Google's favicon service; optional but convenient.
 */
export function faviconUrl(siteUrl, size = 64) {
  const host = toHostname(siteUrl)
  if (!host) return ''
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`
}

export function uniqBy(arr, keyFn) {
  const seen = new Set()
  const out = []
  for (const item of arr) {
    const k = keyFn(item)
    if (!k) continue
    if (seen.has(k)) continue
    seen.add(k)
    out.push(item)
  }
  return out
}

export function sortByPriority(arr) {
  return [...arr].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
}

/* -------------------------- YouTube: Live normalizer -------------------------- */

/**
 * Input:
 * - channelsConfig: from src/config/youtubeChannels.js
 * - livePayload: output from your serverless endpoint /api/youtube-live
 *
 * Output:
 * - cards sorted by priority (config), with LIVE channels pinned to top
 */
export function normalizeYouTubeLiveCards(channelsConfig, livePayload) {
  const byChannelId = new Map(livePayload.channels.map((c) => [c.channelId, c]))

  const cards = channelsConfig.map((ch) => {
    const live = byChannelId.get(ch.channelId)
    const isLive = !!live?.isLive
    const videoId = live?.liveVideoId
    const liveUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : ch.url

    const startedIso = safeIsoDate(live?.startedAt)
    const checkedIso = safeIsoDate(livePayload.checkedAt)

    return {
      id: `yt:${ch.channelId}`,
      kind: 'youtube',
      title: ch.name,
      subtitle: ch.focus ? ch.focus.toUpperCase() : undefined,
      description: isLive
        ? (live?.liveTitle ?? 'LIVE NOW')
        : 'Offline — monitoring for live events.',
      href: liveUrl,
      imageUrl: live?.thumbnail,
      badge: isLive ? 'LIVE' : undefined,
      metaLeft: isLive ? 'LIVE NOW' : 'STATUS: OFFLINE',
      metaRight: isLive
        ? (startedIso ? `Started ${timeAgo(startedIso)}` : 'Live')
        : (checkedIso ? `Checked ${timeAgo(checkedIso)}` : undefined),
      priority: ch.priority,
      channelId: ch.channelId,
      channelUrl: ch.url,
      handle: ch.handle,
      isLive,
      liveVideoId: videoId,
    }
  })

  // Sort:
  // 1) live first
  // 2) then by priority
  // 3) then by name
  const sorted = [...cards].sort((a, b) => {
    const aLive = a.badge === 'LIVE' ? 0 : 1
    const bLive = b.badge === 'LIVE' ? 0 : 1
    if (aLive !== bLive) return aLive - bLive

    const ap = a.priority ?? 999
    const bp = b.priority ?? 999
    if (ap !== bp) return ap - bp

    return String(a.title).localeCompare(String(b.title))
  })

  return sorted
}

/* ------------------------------ News normalizer ------------------------------ */

/**
 * Input:
 * - feedsConfig: from src/config/newsFeeds.js
 * - items: output from your serverless /api/news aggregator (already normalized)
 *
 * Output:
 * - cards sorted by publishedAt desc, de-duped by link
 */
export function normalizeNewsCards(feedsConfig, items, opts = {}) {
  const maxItems = opts.maxItems ?? 60

  const feedByName = new Map()
  for (const f of feedsConfig) feedByName.set(f.name, f)

  const normalized = items.map((it) => {
    const publishedIso = safeIsoDate(it.publishedAt)
    const sourceName = it.source ?? toHostname(it.link)
    const feed = feedByName.get(sourceName)

    // Prefer sourceUrl from item, else feed.siteUrl, else derive from link
    let sourceUrl = it.sourceUrl ?? feed?.siteUrl
    if (!sourceUrl) {
      try {
        sourceUrl = new URL(it.link).origin
      } catch {
        sourceUrl = ''
      }
    }

    return {
      id: it.id ?? `news:${it.link}`,
      kind: 'news',
      title: it.title?.trim() || 'Untitled',
      subtitle: sourceName,
      description: it.summary?.trim(),
      href: it.link,
      imageUrl: it.image,
      badge: feed?.category ? String(feed.category).toUpperCase() : undefined,
      metaLeft: sourceName,
      metaRight: publishedIso ? timeAgo(publishedIso) : undefined,
      publishedAt: publishedIso,
      category: it.category || feed?.category,
      _publishedTs: publishedIso ? new Date(publishedIso).getTime() : 0,
      _sourceUrl: sourceUrl,
    }
  })

  // De-dupe by href (link)
  const deduped = uniqBy(normalized, (c) => c.href ?? c.id)

  // Sort by published desc
  deduped.sort((a, b) => (b._publishedTs ?? 0) - (a._publishedTs ?? 0))

  // Cap list
  const sliced = deduped.slice(0, maxItems)

  // Optionally set favicon if no image and we have a source URL
  const withFallbacks = sliced.map((c) => {
    if (!c.imageUrl && c._sourceUrl) {
      return { ...c, imageUrl: faviconUrl(c._sourceUrl, 64) }
    }
    return c
  })

  // Strip internal fields
  return withFallbacks.map(({ _publishedTs, _sourceUrl, ...rest }) => rest)
}

/* ------------------------------ X normalizer ------------------------------ */

/**
 * Input:
 * - xConfig: from src/config/xAccounts.js
 *
 * Output:
 * - cards sorted by priority
 */
export function normalizeXCards(xConfig) {
  const sorted = sortByPriority(xConfig)

  return sorted.map((acc) => ({
    id: `x:${acc.handle}`,
    kind: 'x',
    title: acc.name,
    subtitle: `@${acc.handle}`,
    description: acc.category ? `CATEGORY: ${acc.category.toUpperCase()}` : 'Space updates',
    href: acc.url,
    badge: acc.category ? acc.category.toUpperCase() : undefined,
    metaLeft: 'LINK OUT',
    metaRight: 'X',
    handle: acc.handle,
    category: acc.category,
  }))
}

/* ---------------------------- Optional: hub composer ---------------------------- */

/**
 * Optional helper: build a single combined list for a unified "Updates" page.
 * Example sort: LIVE YouTube first, then newest news, then X.
 */
export function composeUpdatesFeed(args) {
  const maxTotal = args.maxTotal ?? 60

  const youtubeLive = args.youtubeCards.filter((c) => c.kind === 'youtube' && c.badge === 'LIVE')
  const youtubeOffline = args.youtubeCards.filter((c) => c.kind === 'youtube' && c.badge !== 'LIVE')

  const merged = [
    ...youtubeLive,
    ...args.newsCards,
    ...youtubeOffline.slice(0, 4),
    ...args.xCards,
  ]

  return merged.slice(0, maxTotal)
}
