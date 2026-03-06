import type { StemTemplate } from '../../types'

export const launchFuelRatioTemplate: StemTemplate = {
  id: 'launch-fuel-ratio',
  track: 'math',
  level: 'cadet',
  eventTypes: ['launch'],
  titleTemplate: 'Launch Fuel Ratio Check',
  briefingTemplate: 'Compute the fuel ratio needed for a stable launch.',
  stepBuilder: () => [
    {
      id: 'ratio',
      prompt: 'Compute the ratio 4 ÷ 2 (enter the number).',
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
