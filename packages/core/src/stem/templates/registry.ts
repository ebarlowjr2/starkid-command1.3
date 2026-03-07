import type { StemTemplate, StemTrack, StemLevel } from '../types'
import {
  launchFuelRatioTemplate,
  launchCountdownWindowTemplate,
  eclipseVisibilityTemplate,
  launchServiceAccountFailureTemplate,
  groundStationPermissionMismatchTemplate,
  diskSpaceLogCleanupTemplate,
  serviceRestartRecoveryTemplate,
  anomalyDetectionReviewTemplate,
  classificationConfidenceCheckTemplate,
} from './index'

const TEMPLATES: StemTemplate[] = [
  launchFuelRatioTemplate,
  launchCountdownWindowTemplate,
  eclipseVisibilityTemplate,
  launchServiceAccountFailureTemplate,
  groundStationPermissionMismatchTemplate,
  diskSpaceLogCleanupTemplate,
  serviceRestartRecoveryTemplate,
  anomalyDetectionReviewTemplate,
  classificationConfidenceCheckTemplate,
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
