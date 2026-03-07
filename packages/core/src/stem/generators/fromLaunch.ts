import type { Launch } from '@starkid/types'
import type { StemMission, StemTrack, StemLevel } from '../types'
import { getTemplatesForEvent } from '../templates/registry'

export function generateStemMissionFromLaunch(launch: Launch, track: StemTrack, level: StemLevel): StemMission {
  const templates = getTemplatesForEvent('launch', track, level)
  const template = templates[0]
  const steps = template.stepBuilder({ event: launch, track, level })
  const expectedAnswer = template.expectedAnswerBuilder?.({ event: launch, track, level })

  return {
    id: `stem:launch:${launch.id || launch.name || 'unknown'}`,
    title: template.titleTemplate.replace('{name}', String(launch.name || 'Launch')),
    briefing: template.briefingTemplate,
    track,
    level,
    type: track,
    difficulty: level === 'cadet' ? 'easy' : level === 'explorer' ? 'medium' : 'hard',
    eventSource: 'launch',
    steps,
    grading: template.gradingMode,
    expectedAnswer,
    learningObjectives: template.learningObjectives,
    tags: template.tags,
    requiredData: { launchName: launch.name, net: launch.net },
    timeLimit: 600,
  }
}
