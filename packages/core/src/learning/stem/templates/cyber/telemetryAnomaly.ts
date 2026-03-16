import type { StemTemplate } from '../../types'

export const telemetryAnomalyTemplate: StemTemplate = {
  id: 'cyber.telemetry.anomaly',
  track: 'cyber',
  level: 'specialist',
  eventTypes: ['generic'],
  titleTemplate: 'Satellite Telemetry Anomaly',
  briefingTemplate: 'Detect abnormal telemetry values in a critical system.',
  stepBuilder: () => [
    {
      id: 'outlier',
      prompt: 'A voltage jumps from 12V to 28V. Is this an anomaly?',
      inputType: 'choice',
      choices: ['Yes', 'No'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Yes',
  }),
  tags: ['telemetry', 'anomaly'],
  learningObjectives: ['Identify out-of-range telemetry readings.'],
}
