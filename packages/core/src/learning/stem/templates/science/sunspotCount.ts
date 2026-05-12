import type { StemTemplate } from '../../types'

export const sunspotCountTemplate: StemTemplate = {
  id: 'science.sunspot.count',
  track: 'science',
  level: 'cadet',
  eventTypes: ['solar', 'generic'],
  titleTemplate: 'Sunspot Count Check',
  briefingTemplate: 'Estimate solar activity from sunspot counts.',
  stepBuilder: () => [
    {
      id: 'count',
      prompt: 'If sunspot count is 85, is solar activity high?',
      inputType: 'choice',
      choices: ['Yes', 'No'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Yes',
  }),
  tags: ['solar', 'sunspots'],
  learningObjectives: ['Use sunspot counts to infer activity.'],
}
