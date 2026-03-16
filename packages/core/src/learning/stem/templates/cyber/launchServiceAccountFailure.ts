import type { StemTemplate } from '../../types'

export const launchServiceAccountFailureTemplate: StemTemplate = {
  id: 'cyber.groundstation.auth-failure',
  track: 'cyber',
  level: 'explorer',
  eventTypes: ['launch'],
  titleTemplate: 'Ground Station Access Failure',
  briefingTemplate: 'Telemetry fails due to a permission mismatch. Diagnose the auth issue.',
  stepBuilder: () => [
    {
      id: 'action',
      prompt: 'What is the first step to verify an access failure?',
      inputType: 'choice',
      choices: ['Rotate credentials', 'Disable firewall', 'Check access logs'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Check access logs',
  }),
  tags: ['security', 'launch'],
  learningObjectives: ['Identify incident triage steps.'],
}
