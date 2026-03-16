import type { StemTemplate } from '../../types'

export const solarStormClassificationTemplate: StemTemplate = {
  id: 'ai.solarstorm.classification',
  track: 'ai',
  level: 'explorer',
  eventTypes: ['solar'],
  titleTemplate: 'Solar Storm Classification',
  briefingTemplate: 'Classify a solar flare severity based on intensity.',
  stepBuilder: () => [
    {
      id: 'severity',
      prompt: 'If severity is 75%, which class is most appropriate?',
      inputType: 'choice',
      choices: ['Low', 'Moderate', 'High'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'High',
  }),
  tags: ['solar', 'classification'],
  learningObjectives: ['Map solar intensity to severity categories.'],
}
