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
type AlertsOverrides = {
  launches?: ServiceResult<Alert[]>
  skyEvents?: ServiceResult<any[]>
  solar?: ServiceResult<any>
  artemis?: ServiceResult<Alert[]>
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
    solarResult,
    artemisResult,
  ] = await Promise.all([
    overrides?.launches ?? getLaunchAlerts(),
    overrides?.skyEvents ?? getUpcomingSkyEventsService({ days: 60 }),
    getLunarEvents(90),
    getMoonCycleEvents(60),
    getMeteorShowerEvents(120),
    getPlanetConjunctionEvents(120),
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
  const top = (result.data || []).slice(0, 6)
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
    return {
      id: `sky:${category}:${event.id || event.title || 'unknown'}`,
      type: 'sky-event',
      category,
      title: event.title || 'Sky Event',
      description: event.description || '',
      severity: category === 'lunar_event' ? 'high' : 'info',
      priority: category === 'lunar_event' ? 3 : 1,
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
