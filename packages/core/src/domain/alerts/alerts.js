import { createMissionFromLaunch, createMissionFromEclipse, createMissionFromSolarEvent } from '../missions/missionEngine.js'

export function generateAlerts({ launches = [], skyEvents = [], solarActivity = null } = {}) {
  const alerts = []

  for (const launch of launches) {
    alerts.push({
      id: `launch:${launch.id || launch.name || 'unknown'}`,
      type: 'launch',
      title: launch.name || 'Upcoming Launch',
      severity: 'info',
      source: 'launch-library',
      payload: launch,
    })
  }

  for (const event of skyEvents) {
    alerts.push({
      id: `event:${event.id || event.title || 'unknown'}`,
      type: 'sky-event',
      title: event.title || 'Sky Event',
      severity: event.type === 'eclipse' ? 'high' : 'info',
      source: 'sky-events',
      payload: event,
    })
  }

  if (solarActivity) {
    alerts.push({
      id: `solar:${solarActivity.strongestClass || 'none'}`,
      type: 'solar',
      title: `Solar Activity: ${solarActivity.strongestClass || 'None'}`,
      severity: solarActivity.severityPct >= 60 ? 'high' : 'info',
      source: 'donki',
      payload: solarActivity,
    })
  }

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
