import type { StemTemplate } from '../../types'

export const permissionFixTemplate: StemTemplate = {
  id: 'linux.permission.fix',
  track: 'linux',
  level: 'specialist',
  eventTypes: ['generic', 'launch'],
  titleTemplate: 'Linux Permission Fix',
  briefingTemplate: 'Resolve a permission issue blocking telemetry export.',
  stepBuilder: () => [
    {
      id: 'chmod',
      prompt: 'Which command adds read permission for group on telemetry.log?',
      inputType: 'choice',
      choices: ['chmod g+r telemetry.log', 'chmod o+w telemetry.log', 'chown root telemetry.log'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'chmod g+r telemetry.log',
  }),
  tags: ['linux', 'permissions'],
  learningObjectives: ['Adjust file permissions safely.'],
}
