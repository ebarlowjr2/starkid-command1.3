import type { StemTemplate } from '../../types'

export const logForensicsTemplate: StemTemplate = {
  id: 'cyber.log.forensics',
  track: 'cyber',
  level: 'specialist',
  eventTypes: ['generic', 'launch'],
  titleTemplate: 'Telemetry Log Forensics',
  briefingTemplate: 'Scan logs for unauthorized access attempts.',
  stepBuilder: () => [
    {
      id: 'signal',
      prompt: 'Which log entry indicates brute force behavior?',
      inputType: 'choice',
      choices: ['Repeated failed logins', 'Single success login', 'Normal heartbeat'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Repeated failed logins',
  }),
  tags: ['logs', 'forensics'],
  learningObjectives: ['Identify suspicious access patterns in logs.'],
}
