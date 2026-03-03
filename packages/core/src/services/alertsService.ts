import type { Alert, UserPreference } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { generateAlerts, filterByUserPreference } from '../domain/alerts/alerts.js'
import { getUpcomingLaunches } from './launchesService'
import { getUpcomingSkyEventsService } from './skyEventsService'
import { getSolarActivity } from './solarService'
import type { ServiceResult } from './types'

type AlertsOverrides = {
  launches?: ServiceResult<any[]>
  skyEvents?: ServiceResult<any[]>
  solar?: ServiceResult<any>
}

export async function getAlertsForUser(
  pref?: UserPreference,
  overrides?: AlertsOverrides
): Promise<ServiceResult<Alert[]>> {
  const [launchesResult, skyEventsResult, solarResult] = await Promise.all([
    overrides?.launches ?? getUpcomingLaunches(),
    overrides?.skyEvents ?? getUpcomingSkyEventsService({ days: 60 }),
    overrides?.solar ?? getSolarActivity(),
  ])

  const alerts = await generateAlerts({
    launches: launchesResult.data,
    skyEvents: skyEventsResult.data,
    solarActivity: solarResult.data,
  })

  const filtered = pref ? filterByUserPreference(alerts, pref) : alerts

  const sources: SourceStatus[] = [
    ...launchesResult.sources,
    ...skyEventsResult.sources,
    ...solarResult.sources,
    { name: 'alerts-engine', ok: true, count: filtered.length },
  ]

  const warnings = [
    ...(launchesResult.warnings || []),
    ...(skyEventsResult.warnings || []),
    ...(solarResult.warnings || []),
  ]

  return { data: filtered, sources, warnings: warnings.length ? warnings : undefined }
}
