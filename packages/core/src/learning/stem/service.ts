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
  const createModule = (id: string, overrides: Partial<StemActivity>): Partial<StemActivity> => ({
    lessonSlug: overrides.lessonSlug,
    trainingType: overrides.trainingType || 'Math',
    estimatedMinutes: overrides.estimatedMinutes || 5,
    blockCount: overrides.blockCount || overrides.blockList?.length || 0,
    blockList: overrides.blockList,
    tagline: overrides.tagline,
    missionContext: overrides.missionContext,
    objective: overrides.objective,
    missionOutcomes: overrides.missionOutcomes,
  })

  const moduleOverrides: Record<string, Partial<StemActivity>> = {
    'math.launch.fuel-ratio': createModule('math.launch.fuel-ratio', {
      tagline: 'Mission math for stable liftoff performance',
      trainingType: 'Math',
      estimatedMinutes: 5,
      blockCount: 7,
      blockList: [
        'mission_brief',
        'concept',
        'instruction',
        'question_numeric',
        'question_short_text',
        'checkpoint',
        'submission_prompt',
      ],
      missionContext:
        'Mission Control requires verification of the fuel mixture before launch. Incorrect oxidizer-to-fuel ratios can reduce thrust efficiency and increase the risk of unstable liftoff performance.',
      objective:
        'Determine the correct oxidizer-to-fuel ratio for the rocket stage and prepare your response for Command review.',
      missionOutcomes: [
        'Review the mission brief',
        'Learn the fuel ratio concept',
        'Follow guided instructions',
        'Study a worked example',
        'Calculate a numeric answer',
        'Explain your reasoning',
        'Submit your result to Command',
      ],
      lessonSlug: 'launch-fuel-ratio-calculation',
    }),
    'math.launch.countdown-window': createModule('math.launch.countdown-window', {
      tagline: 'Launch timing logic for critical windows',
      trainingType: 'Math',
      estimatedMinutes: 6,
      blockCount: 6,
      blockList: [
        'mission_brief',
        'concept',
        'instruction',
        'question_numeric',
        'checkpoint',
        'submission_prompt',
      ],
      missionContext:
        'Mission Control needs a fast conversion of launch windows into actionable countdowns. Accurate time conversion prevents missed windows.',
      objective:
        'Convert launch window timing into minutes and confirm the countdown fits within the required window.',
      missionOutcomes: [
        'Review the mission brief',
        'Convert window timing into minutes',
        'Solve a countdown scenario',
        'Verify the timing fits the window',
        'Submit your calculation to Command',
      ],
    }),
  }

  return listStemTemplates().filter((template) => {
    if (filters?.track && template.track !== filters.track) return false
    if (filters?.level && template.level !== filters.level) return false
    return true
  }).map((template) => {
    const baseActivity: StemActivity = {
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
    }

    return {
      ...baseActivity,
      ...(moduleOverrides[template.id] || {}),
    }
  })
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
