import type { StemTemplate } from '../../types'

export const anomalyDetectionReviewTemplate: StemTemplate = {
  id: 'anomaly-detection-review',
  track: 'ai',
  level: 'specialist',
  eventTypes: ['solar', 'generic'],
  titleTemplate: 'Anomaly Detection Review',
  briefingTemplate: 'Review an AI anomaly flag and decide next steps.',
  stepBuilder: () => [
    {
      id: 'decision',
      prompt: 'If confidence is low, what should you do?',
      inputType: 'choice',
      choices: ['Request human review', 'Auto-approve', 'Ignore the model'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Request human review',
  }),
  tags: ['ai', 'review'],
  learningObjectives: ['Apply human-in-the-loop procedures.'],
}
