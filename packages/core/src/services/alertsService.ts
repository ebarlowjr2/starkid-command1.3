import type { Alert, UserPreference } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { getLaunchAlerts } from './launchesService'
import {
  getUpcomingSkyEventsService,
  getLunarEvents,
  getMoonCycleEvents,
  getMeteorShowerEvents,
  getPlanetConjunctionEvents,
} from './skyEventsService'
import { getSolarActivity } from './solarService'
import { getArtemisUpcomingEvents, getArtemisPriorityAlert } from './artemisService'
import { generateMissionFromAlert } from '../learning/stem/service'
import { getAsteroidFlybys } from './asteroidsService'
type AlertsOverrides = {
  launches?: ServiceResult<Alert[]>
  skyEvents?: ServiceResult<any[]>
  solar?: ServiceResult<any>
  artemis?: ServiceResult<Alert[]>
  asteroids?: ServiceResult<any[]>
}

export async function getAlertsForUser(
  pref?: UserPreference,
  overrides?: AlertsOverrides
): Promise<ServiceResult<Alert[]>> {
  const [
    launchesResult,
    skyEventsResult,
    lunarResult,
    moonCyclesResult,
    meteorResult,
    conjunctionResult,
    asteroidResult,
    solarResult,
    artemisResult,
  ] = await Promise.all([
    overrides?.launches ?? getLaunchAlerts(),
    overrides?.skyEvents ?? getUpcomingSkyEventsService({ days: 60 }),
    getLunarEvents(90),
    getMoonCycleEvents(60),
    getMeteorShowerEvents(120),
    getPlanetConjunctionEvents(120),
    overrides?.asteroids ?? getAsteroidFlybys(),
    overrides?.solar ?? getSolarActivity(),
    overrides?.artemis ?? getArtemisUpcomingEvents(),
  ])

  const alerts = [
    ...(launchesResult.data || []),
    ...mapSkyEventsToAlerts(skyEventsResult.data || [], undefined),
    ...mapSkyEventsToAlerts(lunarResult.data || [], 'lunar_event'),
    ...mapSkyEventsToAlerts(moonCyclesResult.data || [], 'moon_cycle'),
    ...mapSkyEventsToAlerts(meteorResult.data || [], 'meteor_shower'),
    ...mapSkyEventsToAlerts(conjunctionResult.data || [], 'planet_conjunction'),
    ...mapAsteroidsToAlerts(asteroidResult.data || []),
    ...mapSolarToAlerts(solarResult.data),
    ...(artemisResult.data || []),
  ]

  const merged = dedupeAlerts(alerts)
  const sorted = sortAlerts(merged)

  const filtered = pref ? filterByUserPreference(sorted, pref) : sorted

  const sources: SourceStatus[] = [
    ...launchesResult.sources,
    ...skyEventsResult.sources,
    ...lunarResult.sources,
    ...moonCyclesResult.sources,
    ...meteorResult.sources,
    ...conjunctionResult.sources,
    ...asteroidResult.sources,
    ...solarResult.sources,
    ...artemisResult.sources,
    { name: 'alerts-engine', ok: true, count: filtered.length },
  ]

  const warnings = [
    ...(launchesResult.warnings || []),
    ...(skyEventsResult.warnings || []),
    ...(lunarResult.warnings || []),
    ...(moonCyclesResult.warnings || []),
    ...(meteorResult.warnings || []),
    ...(conjunctionResult.warnings || []),
    ...(asteroidResult.warnings || []),
    ...(solarResult.warnings || []),
    ...(artemisResult.warnings || []),
  ]

  return { data: filtered, sources, warnings: warnings.length ? warnings : undefined }
}

export function getFeaturedAlerts(): Promise<ServiceResult<Alert[]>> {
  return getMainPageAlerts()
}

export async function getMainPageAlerts(): Promise<ServiceResult<Alert[]>> {
  const result = await getAlertsForUser()
  const data = result.data || []
  const artemis = data.find((alert) => alert.category === 'artemis')
  const rest = data.filter((alert) => alert !== artemis)
  const top = [artemis, ...rest].filter(Boolean).slice(0, 6) as Alert[]
  return { ...result, data: top }
}

export async function getMissionEligibleAlerts(): Promise<ServiceResult<Alert[]>> {
  const result = await getAlertsForUser()
  const missionEligible = (result.data || []).filter((alert) => alert.missionAvailable)
  return { ...result, data: missionEligible }
}

export function convertAlertToMission(alert: Alert, track = 'math', level: any = 'cadet') {
  if (!alert) return null
  return generateMissionFromAlert(alert, track, level)
}

export function filterByUserPreference(alerts: Alert[], userPreference: UserPreference = {}) {
  if (!alerts?.length) return []
  const { mutedTypes = [], minSeverity = null } = userPreference
  return alerts.filter((alert) => {
    if (mutedTypes.includes(alert.category || alert.type)) return false
    if (!minSeverity) return true
    const severityOrder = ['info', 'medium', 'high']
    const alertRank = severityOrder.indexOf(alert.severity || 'info')
    const minRank = severityOrder.indexOf(minSeverity)
    return alertRank >= minRank
  })
}

function mapSkyEventsToAlerts(events: any[], category?: Alert['category']) {
  return (events || []).map((event) => {
    const startTime = event.start || null
    const derivedCategory = category || categoryForSkyEvent(event)
    const priority = skyEventPriority(derivedCategory)
    const severity = skyEventSeverity(derivedCategory)
    return {
      id: `sky:${derivedCategory || 'general'}:${event.id || event.title || 'unknown'}`,
      type: 'sky-event',
      category: derivedCategory,
      title: event.title || 'Sky Event',
      description: event.description || '',
      severity,
      priority,
      source: event.source || 'sky-events',
      sourceUrl: event.sourceUrl,
      startTime,
      missionAvailable: true,
      payload: event,
    } as Alert
  })
}

function mapSolarToAlerts(solar: any): Alert[] {
  if (!solar) return []
  const severity = solar.severityPct >= 60 ? 'high' : 'info'
  return [
    {
      id: `solar:${solar.strongestClass || 'none'}`,
      type: 'solar',
      category: 'space_weather',
      title: `Solar Activity: ${solar.strongestClass || 'None'}`,
      description: 'Solar activity summary',
      severity,
      priority: severity === 'high' ? 4 : 2,
      source: 'donki',
      startTime: null,
      missionAvailable: true,
      payload: solar,
    },
  ]
}

function mapAsteroidsToAlerts(asteroids: any[]): Alert[] {
  return (asteroids || []).map((neo) => {
    const closeApproach = Array.isArray(neo?.close_approach_data)
      ? neo.close_approach_data[0]
      : null
    const date = closeApproach?.close_approach_date_full || closeApproach?.close_approach_date || null
    const distance = closeApproach?.miss_distance?.lunar || closeApproach?.miss_distance?.kilometers
    return {
      id: `asteroid:${neo.id || neo.name}`,
      type: 'asteroid',
      category: 'asteroid_flyby',
      title: neo.name || 'Asteroid Flyby',
      description: distance ? `Closest approach: ${distance} ${closeApproach?.miss_distance?.lunar ? 'LD' : 'km'}` : 'Near-Earth object flyby',
      severity: neo?.is_potentially_hazardous_asteroid ? 'high' : 'info',
      priority: neo?.is_potentially_hazardous_asteroid ? 4 : 2,
      source: 'neo-feed',
      startTime: date,
      missionAvailable: false,
      payload: neo,
    } as Alert
  })
}

function categoryForSkyEvent(event: any): Alert['category'] {
  const type = String(event?.type || '').toLowerCase()
  const title = String(event?.title || '').toLowerCase()
  const text = `${type} ${title}`
  if (text.includes('meteor')) return 'meteor_shower'
  if (text.includes('conjunction')) return 'planet_conjunction'
  if (text.includes('new moon') || text.includes('full moon') || text.includes('moon phase')) return 'moon_cycle'
  if (text.includes('eclipse') || text.includes('lunar')) return 'lunar_event'
  return undefined
}

function skyEventPriority(category?: Alert['category']) {
  if (category === 'lunar_event') return 4
  if (category === 'meteor_shower') return 3
  if (category === 'planet_conjunction') return 2
  if (category === 'moon_cycle') return 1
  return 1
}

function skyEventSeverity(category?: Alert['category']) {
  if (category === 'lunar_event') return 'high'
  if (category === 'meteor_shower') return 'medium'
  return 'info'
}

function dedupeAlerts(alerts: Alert[]) {
  const seen = new Set<string>()
  const result: Alert[] = []
  for (const alert of alerts) {
    const key = alert.id || `${alert.title}|${alert.startTime || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(alert)
  }
  return result
}

function sortAlerts(alerts: Alert[]) {
  return [...alerts].sort((a, b) => {
    const aPinned = a.category === 'artemis' ? 1 : 0
    const bPinned = b.category === 'artemis' ? 1 : 0
    if (aPinned !== bPinned) return bPinned - aPinned
    const aPriority = a.priority || 0
    const bPriority = b.priority || 0
    if (aPriority !== bPriority) return bPriority - aPriority
    const aTime = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY
    const bTime = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY
    if (aTime !== bTime) return aTime - bTime
    return String(a.id).localeCompare(String(b.id))
  })
}
