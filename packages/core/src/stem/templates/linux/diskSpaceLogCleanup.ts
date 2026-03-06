import type { StemTemplate } from '../../types'

export const diskSpaceLogCleanupTemplate: StemTemplate = {
  id: 'disk-space-log-cleanup',
  track: 'linux',
  level: 'cadet',
  eventTypes: ['generic', 'solar'],
  titleTemplate: 'Disk Space Log Cleanup',
  briefingTemplate: 'Free disk space by archiving log files.',
  stepBuilder: () => [
    {
      id: 'command',
      prompt: 'Which command compresses a log file named telemetry.log?',
      inputType: 'choice',
      choices: ['gzip telemetry.log', 'rm telemetry.log', 'cat telemetry.log'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'gzip telemetry.log',
  }),
  tags: ['linux', 'storage'],
  learningObjectives: ['Recognize log cleanup commands.'],
}
