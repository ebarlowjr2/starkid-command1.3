import type { StemMission, StemTrack, StemLevel } from '../types'
import type { SolarActivity } from '@starkid/types'
import { getTemplatesForEvent } from '../templates/registry'

export function generateStemMissionFromSolarEvent(event: SolarActivity, track: StemTrack, level: StemLevel): StemMission {
  const templates = getTemplatesForEvent('solar', track, level)
  const template = templates[0]
  const steps = template.stepBuilder({ event, track, level })
  const expectedAnswer = template.expectedAnswerBuilder?.({ event, track, level })

  return {
    id: `stem:solar:${event?.strongestClass || 'unknown'}`,
    title: template.titleTemplate.replace('{name}', `Solar ${event?.strongestClass || 'Activity'}`),
    briefing: template.briefingTemplate,
    track,
    level,
    type: track,
    difficulty: level === 'cadet' ? 'easy' : level === 'explorer' ? 'medium' : 'hard',
    eventSource: 'solar',
    steps,
    grading: template.gradingMode,
    expectedAnswer,
    learningObjectives: template.learningObjectives,
    tags: template.tags,
    requiredData: { strongestClass: event?.strongestClass, severityPct: event?.severityPct },
    timeLimit: 600,
  }
}
