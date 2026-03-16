import type { StemTemplate } from '../../types'

export const processMonitoringTemplate: StemTemplate = {
  id: 'linux.process.monitoring',
  track: 'linux',
  level: 'operator',
  eventTypes: ['generic', 'solar'],
  titleTemplate: 'Process Monitoring Check',
  briefingTemplate: 'Identify a runaway process affecting telemetry.',
  stepBuilder: () => [
    {
      id: 'top',
      prompt: 'Which command shows live CPU usage by process?',
      inputType: 'choice',
      choices: ['top', 'ls', 'pwd'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'top',
  }),
  tags: ['linux', 'monitoring'],
  learningObjectives: ['Use basic tools to inspect running processes.'],
}
