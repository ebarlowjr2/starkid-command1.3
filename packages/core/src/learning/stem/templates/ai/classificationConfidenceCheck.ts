import type { StemTemplate } from '../../types'

export const classificationConfidenceCheckTemplate: StemTemplate = {
  id: 'classification-confidence-check',
  track: 'ai',
  level: 'explorer',
  eventTypes: ['generic'],
  titleTemplate: 'Classification Confidence Check',
  briefingTemplate: 'Validate a model classification confidence score.',
  stepBuilder: () => [
    {
      id: 'threshold',
      prompt: 'If the confidence threshold is 0.8, does a score of 0.72 pass?',
      inputType: 'choice',
      choices: ['Yes', 'No'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'No',
  }),
  tags: ['ai', 'classification'],
  learningObjectives: ['Interpret model confidence thresholds.'],
}
