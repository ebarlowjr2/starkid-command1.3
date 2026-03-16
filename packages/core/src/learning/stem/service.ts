import type { Alert } from '@starkid/types'
import type { StemActivity, StemLevel, StemMission, StemTemplate, StemTrack } from './types'
import { gradeStemAttempt as gradeStemAttemptInternal } from './grading/autoGrade'
import { augmentMissionText } from './ai/augment'
import { getLevelConfig } from './levels/levels'
import { generateStemMissionFromLaunch } from './generators/fromLaunch'
import { generateStemMissionFromSkyEvent } from './generators/fromSkyEvent'
import { generateStemMissionFromSolarEvent } from './generators/fromSolarEvent'
import { listStemTemplates, getTemplatesForEvent as getTemplatesForEventRegistry } from './templates/registry'

const missionRegistry = new Map<string, StemMission>()

export function listTracks(): StemTrack[] {
  return ['math', 'cyber', 'linux', 'ai', 'science']
}

export function listLevels(): StemLevel[] {
  return ['cadet', 'explorer', 'specialist', 'operator']
}

function mapDifficulty(level: StemLevel): 'easy' | 'medium' | 'hard' {
  if (level === 'cadet') return 'easy'
  if (level === 'explorer') return 'medium'
  return 'hard'
}

export function listStemActivities(filters?: { track?: StemTrack; level?: StemLevel }): StemActivity[] {
  return listStemTemplates().filter((template) => {
    if (filters?.track && template.track !== filters.track) return false
    if (filters?.level && template.level !== filters.level) return false
    return true
  }).map((template) => ({
    id: template.id,
    title: template.titleTemplate,
    description: template.briefingTemplate,
    track: template.track,
    level: template.level,
    tags: template.tags,
    learningObjectives: template.learningObjectives,
    steps: template.stepBuilder({ level: template.level, track: template.track }),
    grading: template.gradingMode,
    expectedAnswer: template.expectedAnswerBuilder?.({ level: template.level, track: template.track }),
    sourceType: 'structured',
  }))
}

export function getStemActivityById(id: string): StemActivity | null {
  return listStemActivities().find((activity) => activity.id === id) || null
}

export function getTemplatesForEvent(eventType: StemTemplate['eventTypes'][number], track: StemTrack, level: StemLevel) {
  return getTemplatesForEventRegistry(eventType, track, level)
}

export function generateMissionFromEvent(
  event: { type?: string; sourceType?: string } | any,
  track: StemTrack,
  level: StemLevel
): StemMission {
  if (event?.type === 'launch' || event?.net || event?.window_start) {
    return registerMission(generateStemMissionFromLaunch(event, track, level))
  }
  if (event?.type === 'eclipse' || event?.start) {
    return registerMission(generateStemMissionFromSkyEvent(event, track, level))
  }
  if (event?.strongestClass || event?.severityPct) {
    return registerMission(generateStemMissionFromSolarEvent(event, track, level))
  }
  return registerMission(generateStemMissionFromSkyEvent({ title: 'Observation', start: new Date().toISOString() }, track, level))
}

export function generateMissionFromAlert(
  alert: Alert,
  track: StemTrack = 'math',
  level: StemLevel = 'cadet'
): StemMission {
  const event = alert?.payload || {}
  const mission = generateMissionFromEvent(event, track, level)
  const withDifficulty = { ...mission, type: track, difficulty: mapDifficulty(level) }
  return registerMission(augmentMissionText(withDifficulty))
}

export function registerMission(mission: StemMission) {
  if (mission?.id) {
    missionRegistry.set(mission.id, mission)
  }
  return mission
}

export function getMissionById(id: string) {
  return missionRegistry.get(id) || null
}

export function listAvailableMissionsFromAlerts(
  alerts: Alert[],
  track: StemTrack = 'math',
  level: StemLevel = 'cadet'
) {
  return (alerts || []).map((alert) => generateMissionFromAlert(alert, track, level))
}

export function gradeStemAttempt(activityOrMission: StemActivity | StemMission, answers: Record<string, unknown>) {
  return gradeStemAttemptInternal(activityOrMission, answers)
}

export function getLevelConfigFor(level: StemLevel) {
  return getLevelConfig(level)
}
