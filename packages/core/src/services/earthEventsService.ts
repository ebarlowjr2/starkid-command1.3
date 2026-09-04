import type { EarthEvent } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { getOpenEarthEvents as getOpenEarthEventsFromEonet } from '../clients/nasa/eonet.js'
import { getWithTTL, setWithTTL } from '../storage/cache.js'

type EarthEventOverrides = {
  events?: unknown[]
}

export async function getOpenEarthEvents({
  limit = 24,
  days = 14,
  sourcesOverride,
}: {
  limit?: number
  days?: number
  sourcesOverride?: EarthEventOverrides
} = {}): Promise<ServiceResult<EarthEvent[]>> {
  const sources: SourceStatus[] = []
  const warnings: string[] = []
  const cacheKey = `starkid:cache:earth-events:open:${limit}:${days}`
  const cached = await getWithTTL(cacheKey, true)

  let rawEvents: unknown[] = []
  if (sourcesOverride?.events !== undefined) {
    rawEvents = sourcesOverride.events
    sources.push({ name: 'nasa-eonet', ok: true, count: rawEvents.length })
  } else {
    try {
      rawEvents = await getOpenEarthEventsFromEonet({ limit, days })
      sources.push({ name: 'nasa-eonet', ok: true, count: rawEvents.length })
    } catch (error: any) {
      sources.push({ name: 'nasa-eonet', ok: false, error: error?.message || 'failed' })
    }
  }

  const data = normalizeEarthEvents(rawEvents).slice(0, limit)
  if (data.length) {
    await setWithTTL(cacheKey, data, 30 * 60 * 1000)
    return { data, sources }
  }

  if (Array.isArray(cached) && cached.length) {
    sources.push({ name: 'cache', ok: true, count: cached.length })
    return { data: cached as EarthEvent[], sources, warnings: ['Using cached Earth-event data'] }
  }

  warnings.push('Earth-event source unavailable')
  return { data: [], sources, warnings }
}

export function normalizeEarthEvents(rawEvents: unknown[]): EarthEvent[] {
  const events: EarthEvent[] = []

  for (const raw of rawEvents) {
    const feature = raw as any
    const coordinates = feature?.geometry?.type === 'Point' ? feature.geometry.coordinates : null
    const longitude = Number(coordinates?.[0])
    const latitude = Number(coordinates?.[1])
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue

    const properties = feature?.properties || {}
    const category = properties?.categories?.[0]?.title || 'Earth event'
    const magnitude = properties?.magnitudeValue != null
      ? `${properties.magnitudeValue}${properties.magnitudeUnit ? ` ${properties.magnitudeUnit}` : ''}`
      : undefined

    events.push({
      id: String(properties?.id || `${category}-${latitude}-${longitude}`),
      title: properties?.title || 'Active Earth event',
      category,
      latitude,
      longitude,
      observedAt: properties?.date,
      description: properties?.description || undefined,
      magnitude,
      sourceUrl: properties?.link,
    })
  }

  const seen = new Set<string>()
  return events
    .sort((a, b) => Date.parse(b.observedAt || '') - Date.parse(a.observedAt || ''))
    .filter((event) => {
      if (seen.has(event.id)) return false
      seen.add(event.id)
      return true
    })
}
