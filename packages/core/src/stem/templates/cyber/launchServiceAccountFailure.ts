import type { StemTemplate } from '../../types'

export const launchServiceAccountFailureTemplate: StemTemplate = {
  id: 'launch-service-account-failure',
  track: 'cyber',
  level: 'explorer',
  eventTypes: ['launch'],
  titleTemplate: 'Service Account Failure',
  briefingTemplate: 'Diagnose a failed service account check before launch.',
  stepBuilder: () => [
    {
      id: 'action',
      prompt: 'What is the first step to verify a service account issue?',
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
