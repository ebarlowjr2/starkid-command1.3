import type { SkyEvent } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { getUpcomingSkyEvents } from '../domain/skyEvents/skyEventsDb.js'
import { getSkyEvents } from '../domain/skyEvents/skyEvents.js'
import { getCoreConfig } from '../config/coreConfig.ts'

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

  if (!merged.length && sources.every((source) => !source.ok)) {
    warnings.push('All sky event sources failed')
  }

  return { data: merged, sources, warnings: warnings.length ? warnings : undefined }
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
