import type { SkyEvent } from '@starkid/types'
import type { StemMission, StemTrack, StemLevel } from '../types'
import { getTemplatesForEvent } from '../templates/registry'

export function generateStemMissionFromSkyEvent(event: SkyEvent, track: StemTrack, level: StemLevel): StemMission {
  const templates = getTemplatesForEvent(event.type === 'eclipse' ? 'eclipse' : 'generic', track, level)
  const template = templates[0]
  const steps = template.stepBuilder({ event, track, level })
  const expectedAnswer = template.expectedAnswerBuilder?.({ event, track, level })

  return {
    id: `stem:sky:${event.id || event.title || 'unknown'}`,
    title: template.titleTemplate.replace('{name}', String(event.title || 'Sky Event')),
    briefing: template.briefingTemplate,
    track,
    level,
    type: track,
    difficulty: level === 'cadet' ? 'easy' : level === 'explorer' ? 'medium' : 'hard',
    eventSource: 'sky-event',
    steps,
    grading: template.gradingMode,
    expectedAnswer,
    learningObjectives: template.learningObjectives,
    tags: template.tags,
    requiredData: { eventTitle: event.title, start: event.start },
    timeLimit: 600,
  }
}
