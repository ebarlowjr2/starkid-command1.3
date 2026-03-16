import type { StemTemplate } from '../../types'

export const satellitePatternDetectionTemplate: StemTemplate = {
  id: 'ai.satellite.pattern-detection',
  track: 'ai',
  level: 'specialist',
  eventTypes: ['generic'],
  titleTemplate: 'Satellite Image Pattern Detection',
  briefingTemplate: 'Identify anomalies in satellite imagery data.',
  stepBuilder: () => [
    {
      id: 'pattern',
      prompt: 'A bright streak appears where none existed before. Is this an anomaly?',
      inputType: 'choice',
      choices: ['Yes', 'No'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Yes',
  }),
  tags: ['imagery', 'ai'],
  learningObjectives: ['Detect unexpected patterns in satellite imagery.'],
}
