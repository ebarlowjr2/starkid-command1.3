import type { StemTemplate } from '../../types'

export const serviceRestartRecoveryTemplate: StemTemplate = {
  id: 'linux.service.restart',
  track: 'linux',
  level: 'explorer',
  eventTypes: ['generic', 'solar'],
  titleTemplate: 'Service Restart Recovery',
  briefingTemplate: 'Restore a mission service after an outage.',
  stepBuilder: () => [
    {
      id: 'restart',
      prompt: 'Which command restarts a systemd service named telemetry?',
      inputType: 'choice',
      choices: ['systemctl restart telemetry', 'service telemetry stop', 'journalctl -u telemetry'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'systemctl restart telemetry',
  }),
  tags: ['linux', 'recovery'],
  learningObjectives: ['Apply systemd recovery commands.'],
}
