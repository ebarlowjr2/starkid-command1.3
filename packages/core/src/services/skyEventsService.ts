import type { SkyEvent } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { getUpcomingSkyEvents } from '../domain/skyEvents/skyEventsDb.js'
import { getSkyEvents } from '../domain/skyEvents/skyEvents.js'
import { getCoreConfig } from '../config/coreConfig.ts'
import { getWithTTL, setWithTTL } from '../storage/cache.js'

type SkyEventOverrides = {
  dbEvents?: SkyEvent[]
  staticEvents?: SkyEvent[]
}

export async function getUpcomingSkyEventsService({
  days = 30,
  sourcesOverride,
}: {
  days?: number
  sourcesOverride?: SkyEventOverrides
} = {}): Promise<ServiceResult<SkyEvent[]>> {
  const sources: SourceStatus[] = []
  const warnings: string[] = []
  const cacheKey = `starkid:cache:skyevents:${days}`
  const cached = await getWithTTL(cacheKey, true)

  let dbEvents: SkyEvent[] = []
  let staticEvents: SkyEvent[] = []

  if (sourcesOverride?.dbEvents) {
    dbEvents = sourcesOverride.dbEvents
    sources.push({ name: 'sky-events-db', ok: true, count: dbEvents.length })
  } else {
    const apiBase = getCoreConfig().apiBase
    if (!apiBase) {
      sources.push({ name: 'sky-events-db', ok: false, error: 'apiBase not configured' })
    } else {
      try {
        dbEvents = await getUpcomingSkyEvents({ days })
        sources.push({ name: 'sky-events-db', ok: true, count: dbEvents.length })
      } catch (error: any) {
        sources.push({ name: 'sky-events-db', ok: false, error: error?.message || 'failed' })
      }
    }
  }

  if (sourcesOverride?.staticEvents) {
    staticEvents = sourcesOverride.staticEvents
    sources.push({ name: 'sky-events-static', ok: true, count: staticEvents.length })
  } else {
    try {
      staticEvents = await getSkyEvents({ days })
      sources.push({ name: 'sky-events-static', ok: true, count: staticEvents.length })
    } catch (error: any) {
      sources.push({ name: 'sky-events-static', ok: false, error: error?.message || 'failed' })
    }
  }

  const merged = normalizeSkyEvents(dbEvents, staticEvents)

  if (merged.length) {
    await setWithTTL(cacheKey, merged, 12 * 60 * 60 * 1000)
  } else if (cached?.length) {
    warnings.push('Using cached sky events')
    sources.push({ name: 'cache', ok: true, count: cached.length })
    return { data: cached, sources, warnings }
  }

  if (!merged.length && sources.every((source) => !source.ok)) {
    warnings.push('All sky event sources failed')
  }

  return { data: merged, sources, warnings: warnings.length ? warnings : undefined }
}

export async function getMoonCycleEvents(rangeDays = 30): Promise<ServiceResult<SkyEvent[]>> {
  const result = await getUpcomingSkyEventsService({ days: rangeDays })
  const data = (result.data || []).filter((event) => isMoonCycle(event))
  return { data, sources: result.sources, warnings: result.warnings }
}

export async function getMeteorShowerEvents(rangeDays = 60): Promise<ServiceResult<SkyEvent[]>> {
  const result = await getUpcomingSkyEventsService({ days: rangeDays })
  const data = (result.data || []).filter((event) => isMeteorShower(event))
  return { data, sources: result.sources, warnings: result.warnings }
}

export async function getPlanetConjunctionEvents(rangeDays = 60): Promise<ServiceResult<SkyEvent[]>> {
  const result = await getUpcomingSkyEventsService({ days: rangeDays })
  const data = (result.data || []).filter((event) => isConjunction(event))
  return { data, sources: result.sources, warnings: result.warnings }
}

export async function getLunarEvents(rangeDays = 60): Promise<ServiceResult<SkyEvent[]>> {
  const result = await getUpcomingSkyEventsService({ days: rangeDays })
  const data = (result.data || []).filter((event) => isLunarEvent(event))
  return { data, sources: result.sources, warnings: result.warnings }
}

export function normalizeSkyEvents(dbEvents: SkyEvent[], staticEvents: SkyEvent[]) {
  const items: SkyEvent[] = []
  const seen = new Set<string>()

  const all = [...(dbEvents || []), ...(staticEvents || [])]
  for (const event of all) {
    const normalized: SkyEvent = {
      id: event.id || event.title,
      title: event.title,
      type: event.type,
      start: event.start,
      end: event.end,
      description: event.description,
      visibility: event.visibility,
      source: event.source,
      sourceUrl: event.sourceUrl,
      metadata: event.metadata,
    }
    const key = makeSkyEventKey(normalized)
    if (seen.has(key)) continue
    seen.add(key)
    items.push(normalized)
  }

  items.sort((a, b) => {
    const aTime = getEventTime(a)
    const bTime = getEventTime(b)
    if (aTime !== bTime) return aTime - bTime
    return String(a.title || '').localeCompare(String(b.title || ''))
  })

  return items
}

export function groupEventsByType(events: SkyEvent[]) {
  const groups: Record<string, SkyEvent[]> = {
    'moon-phase': [],
    'meteor-shower': [],
    'conjunction': [],
    'planet-event': [],
    'eclipse': [],
    'other': [],
  }

  events.forEach((event) => {
    const type = event.type || 'other'
    if (groups[type]) {
      groups[type].push(event)
    } else {
      groups.other.push(event)
    }
  })

  return groups
}

function makeSkyEventKey(event: SkyEvent) {
  const dateKey = event.start || 'unknown'
  return `${event.title || 'event'}|${dateKey}`
}

function getEventTime(event: SkyEvent) {
  if (!event.start) return Number.POSITIVE_INFINITY
  const time = new Date(event.start).getTime()
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

function matchAny(text: string, terms: string[]) {
  const lower = text.toLowerCase()
  return terms.some((term) => lower.includes(term))
}

function isMoonCycle(event: SkyEvent) {
  const type = (event.type || '').toLowerCase()
  const title = (event.title || '').toLowerCase()
  return matchAny(type, ['moon-phase', 'moon phase']) || matchAny(title, ['new moon', 'full moon', 'first quarter', 'third quarter'])
}

function isMeteorShower(event: SkyEvent) {
  const type = (event.type || '').toLowerCase()
  const title = (event.title || '').toLowerCase()
  return matchAny(type, ['meteor', 'meteor-shower']) || matchAny(title, ['meteor shower'])
}

function isConjunction(event: SkyEvent) {
  const type = (event.type || '').toLowerCase()
  const title = (event.title || '').toLowerCase()
  return matchAny(type, ['conjunction']) || matchAny(title, ['conjunction'])
}

function isLunarEvent(event: SkyEvent) {
  const type = (event.type || '').toLowerCase()
  const title = (event.title || '').toLowerCase()
  return matchAny(type, ['eclipse', 'lunar']) || matchAny(title, ['lunar', 'eclipse', 'perigee', 'apogee'])
}
