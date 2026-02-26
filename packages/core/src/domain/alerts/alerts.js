import { createMissionFromLaunch, createMissionFromEclipse, createMissionFromSolarEvent } from '../missions/missionEngine.js'
import { getUpcomingLaunchesFromLibrary } from '../launches/launchLibrary.js'
import { getAllSkyEvents } from '../skyEvents/skyEventsDb.js'
import { getRecentSolarActivity } from '../../clients/nasa/nasa.js'

const severityPriority = {
  high: 3,
  medium: 2,
  info: 1,
}

export async function generateAlerts({ launches, skyEvents, solarActivity } = {}) {
  const [
    launchData,
    skyEventData,
    solarData,
  ] = await Promise.all([
    launches ?? getUpcomingLaunchesFromLibrary(10).catch(() => []),
    skyEvents ?? getAllSkyEvents({ days: 60 }).catch(() => []),
    solarActivity ?? getRecentSolarActivity(3).catch(() => null),
  ])

  const alerts = []

  for (const launch of launchData || []) {
    const startTime = launch.net || launch.window_start || null
    alerts.push({
      id: `launch:${launch.id || launch.name || 'unknown'}`,
      type: 'launch',
      title: launch.name || 'Upcoming Launch',
      severity: 'medium',
      priority: severityPriority.medium,
      source: 'launch-library',
      startTime,
      missionAvailable: true,
      payload: launch,
    })
  }

  for (const event of skyEventData || []) {
    const severity = event.type === 'eclipse' ? 'high' : 'info'
    const startTime = event.start || null
    alerts.push({
      id: `event:${event.id || event.title || 'unknown'}`,
      type: 'sky-event',
      title: event.title || 'Sky Event',
      severity,
      priority: severityPriority[severity] || severityPriority.info,
      source: 'sky-events',
      startTime,
      missionAvailable: true,
      payload: event,
    })
  }

  if (solarData) {
    const severity = solarData.severityPct >= 60 ? 'high' : 'info'
    alerts.push({
      id: `solar:${solarData.strongestClass || 'none'}`,
      type: 'solar',
      title: `Solar Activity: ${solarData.strongestClass || 'None'}`,
      severity,
      priority: severityPriority[severity] || severityPriority.info,
      source: 'donki',
      startTime: null,
      missionAvailable: true,
      payload: solarData,
    })
  }

  alerts.sort((a, b) => {
    const aTime = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY
    const bTime = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY
    if (aTime !== bTime) return aTime - bTime
    if ((b.priority || 0) !== (a.priority || 0)) return (b.priority || 0) - (a.priority || 0)
    return String(a.id).localeCompare(String(b.id))
  })

  return alerts
}

export function convertAlertToMission(alert) {
  if (!alert) return null

  switch (alert.type) {
    case 'launch':
      return createMissionFromLaunch(alert.payload)
    case 'sky-event':
      return createMissionFromEclipse(alert.payload)
    case 'solar':
      return createMissionFromSolarEvent(alert.payload)
    default:
      return null
  }
}

export function filterByUserPreference(alerts, userPreference = {}) {
  if (!alerts?.length) return []

  const { mutedTypes = [], minSeverity = null } = userPreference

  return alerts.filter((alert) => {
    if (mutedTypes.includes(alert.type)) return false
    if (!minSeverity) return true

    const severityOrder = ['info', 'medium', 'high']
    const alertRank = severityOrder.indexOf(alert.severity || 'info')
    const minRank = severityOrder.indexOf(minSeverity)
    return alertRank >= minRank
  })
}
