import type { StemTemplate } from '../../types'

export const orbitEscapeVelocityTemplate: StemTemplate = {
  id: 'science.orbit.escape-velocity',
  track: 'science',
  level: 'specialist',
  eventTypes: ['generic'],
  titleTemplate: 'Orbital Escape Velocity',
  briefingTemplate: 'Compare orbital velocity to escape velocity for a mission.',
  stepBuilder: () => [
    {
      id: 'escape',
      prompt: 'If orbital velocity is 7.8 km/s and escape velocity is 11.2 km/s, is escape achieved?',
      inputType: 'choice',
      choices: ['Yes', 'No'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'No',
  }),
  tags: ['orbit', 'physics'],
  learningObjectives: ['Differentiate orbital vs escape velocity.'],
}
