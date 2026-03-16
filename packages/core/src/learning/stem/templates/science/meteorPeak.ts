import type { StemTemplate } from '../../types'

export const meteorPeakTemplate: StemTemplate = {
  id: 'science.meteor.peak',
  track: 'science',
  level: 'explorer',
  eventTypes: ['generic'],
  titleTemplate: 'Meteor Shower Peak Predictor',
  briefingTemplate: 'Estimate when a meteor shower will peak for best viewing.',
  stepBuilder: () => [
    {
      id: 'peak',
      prompt: 'If a shower peaks at 02:00 local time, when is the best viewing hour?',
      inputType: 'choice',
      choices: ['Midnight', '2 AM', '6 AM'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: '2 AM',
  }),
  tags: ['meteor', 'timing'],
  learningObjectives: ['Estimate optimal viewing windows for meteor showers.'],
}
