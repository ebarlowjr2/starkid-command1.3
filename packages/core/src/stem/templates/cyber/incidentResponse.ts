import type { StemTemplate } from '../../types'

export const incidentResponseTemplate: StemTemplate = {
  id: 'cyber.incident.response',
  track: 'cyber',
  level: 'operator',
  eventTypes: ['generic', 'launch'],
  titleTemplate: 'Incident Response Drill',
  briefingTemplate: 'Respond to a suspected telemetry intrusion.',
  stepBuilder: () => [
    {
      id: 'contain',
      prompt: 'What is the first response step?',
      inputType: 'choice',
      choices: ['Contain system', 'Ignore alert', 'Publish report'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Contain system',
  }),
  tags: ['incident-response', 'security'],
  learningObjectives: ['Apply first-response containment steps.'],
}
