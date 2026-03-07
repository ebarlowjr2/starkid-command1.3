import type { StemTemplate, StemTrack, StemLevel } from '../types'
import {
  launchFuelRatioTemplate,
  launchCountdownWindowTemplate,
  eclipseVisibilityTemplate,
  orbitalVelocityTemplate,
  launchServiceAccountFailureTemplate,
  groundStationPermissionMismatchTemplate,
  telemetryAnomalyTemplate,
  diskSpaceLogCleanupTemplate,
  serviceRestartRecoveryTemplate,
  anomalyDetectionReviewTemplate,
  classificationConfidenceCheckTemplate,
  solarStormClassificationTemplate,
  satellitePatternDetectionTemplate,
  moonPhaseTemplate,
  meteorPeakTemplate,
} from './index'

const TEMPLATES: StemTemplate[] = [
  launchFuelRatioTemplate,
  launchCountdownWindowTemplate,
  eclipseVisibilityTemplate,
  orbitalVelocityTemplate,
  launchServiceAccountFailureTemplate,
  groundStationPermissionMismatchTemplate,
  telemetryAnomalyTemplate,
  diskSpaceLogCleanupTemplate,
  serviceRestartRecoveryTemplate,
  anomalyDetectionReviewTemplate,
  classificationConfidenceCheckTemplate,
  solarStormClassificationTemplate,
  satellitePatternDetectionTemplate,
  moonPhaseTemplate,
  meteorPeakTemplate,
]

export function listStemTemplates(): StemTemplate[] {
  return TEMPLATES
}

export function getTemplatesForEvent(
  eventType: StemTemplate['eventTypes'][number],
  track: StemTrack,
  level: StemLevel
) {
  return TEMPLATES.filter((template) =>
    template.track === track &&
    template.level === level &&
    template.eventTypes.includes(eventType)
  )
}
