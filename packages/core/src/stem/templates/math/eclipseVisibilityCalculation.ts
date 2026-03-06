import type { StemTemplate } from '../../types'

export const eclipseVisibilityTemplate: StemTemplate = {
  id: 'eclipse-visibility-calculation',
  track: 'math',
  level: 'explorer',
  eventTypes: ['eclipse'],
  titleTemplate: 'Eclipse Visibility Calculation',
  briefingTemplate: 'Estimate the visibility window for an eclipse.',
  stepBuilder: () => [
    {
      id: 'duration',
      prompt: 'If an eclipse lasts 2 hours, how many minutes is the visibility window?',
      inputType: 'number',
      unitLabel: 'minutes',
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'number',
    value: 120,
    tolerance: 1,
  }),
  tags: ['eclipse', 'time'],
  learningObjectives: ['Estimate time windows for observation planning.'],
}
