import type { StemTemplate } from '../../types'

export const groundStationPermissionMismatchTemplate: StemTemplate = {
  id: 'ground-station-permission-mismatch',
  track: 'cyber',
  level: 'specialist',
  eventTypes: ['launch', 'generic'],
  titleTemplate: 'Ground Station Permission Mismatch',
  briefingTemplate: 'Resolve a permissions mismatch in ground station access.',
  stepBuilder: () => [
    {
      id: 'fix',
      prompt: 'Which action best resolves a permission mismatch?',
      inputType: 'choice',
      choices: ['Escalate role approval', 'Ignore warning', 'Restart terminal'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Escalate role approval',
  }),
  tags: ['permissions', 'ground-station'],
  learningObjectives: ['Apply least-privilege remediation steps.'],
}
