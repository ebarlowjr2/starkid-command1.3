import type { StemTemplate } from '../../types'

export const eclipseVisibilityTemplate: StemTemplate = {
  id: 'science.eclipse.visibility',
  track: 'science',
  level: 'explorer',
  eventTypes: ['eclipse'],
  titleTemplate: 'Eclipse Visibility Prediction',
  briefingTemplate: 'Determine whether an eclipse is visible from a location.',
  stepBuilder: () => [
    {
      id: 'duration',
      prompt: 'If the eclipse path passes within 100 km of an observer, is it visible?',
      inputType: 'choice',
      choices: ['Yes', 'No'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Yes',
  }),
  tags: ['eclipse', 'visibility'],
  learningObjectives: ['Evaluate eclipse visibility from a given location.'],
}
