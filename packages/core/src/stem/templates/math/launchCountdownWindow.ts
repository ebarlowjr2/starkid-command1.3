import type { StemTemplate } from '../../types'

export const launchCountdownWindowTemplate: StemTemplate = {
  id: 'launch-countdown-window',
  track: 'math',
  level: 'explorer',
  eventTypes: ['launch'],
  titleTemplate: 'Launch Countdown Window',
  briefingTemplate: 'Calculate the minutes remaining until launch.',
  stepBuilder: (context) => [
    {
      id: 'countdown',
      prompt: 'If the launch window opens in 2 hours and 30 minutes, how many minutes remain?',
      inputType: 'number',
      unitLabel: 'minutes',
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'number',
    value: 150,
    tolerance: 1,
  }),
  tags: ['time', 'launch'],
  learningObjectives: ['Convert time windows into minutes.'],
}
