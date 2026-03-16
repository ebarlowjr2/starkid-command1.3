import type { StemTemplate } from '../../types'

export const launchFuelRatioTemplate: StemTemplate = {
  id: 'math.launch.fuel-ratio',
  track: 'math',
  level: 'cadet',
  eventTypes: ['launch'],
  titleTemplate: 'Launch Fuel Ratio Calculation',
  briefingTemplate: 'Compute the correct fuel mix ratio required for a rocket stage.',
  stepBuilder: () => [
    {
      id: 'ratio',
      prompt: 'If oxidizer is 4 units and fuel is 2 units, what is the oxidizer-to-fuel ratio?',
      inputType: 'number',
      unitLabel: null,
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'number',
    value: 2,
    tolerance: 0.01,
  }),
  tags: ['ratios', 'launch'],
  learningObjectives: ['Understand ratios used in launch planning.'],
}
