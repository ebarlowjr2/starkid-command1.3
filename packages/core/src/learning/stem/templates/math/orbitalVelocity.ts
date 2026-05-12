import type { StemTemplate } from '../../types'

export const orbitalVelocityTemplate: StemTemplate = {
  id: 'math.orbital.velocity',
  track: 'math',
  level: 'explorer',
  eventTypes: ['generic'],
  titleTemplate: 'Orbital Velocity Estimator',
  briefingTemplate: 'Calculate approximate orbital velocity for a satellite.',
  stepBuilder: () => [
    {
      id: 'velocity',
      prompt: 'A low Earth orbit satellite needs ~7.8 km/s. Enter the velocity.',
      inputType: 'number',
      unitLabel: 'km/s',
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'number',
    value: 7.8,
    tolerance: 0.2,
  }),
  tags: ['orbit', 'physics'],
  learningObjectives: ['Estimate orbital velocity for low Earth orbit.'],
}
