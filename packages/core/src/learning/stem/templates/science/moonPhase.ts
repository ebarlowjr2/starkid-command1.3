import type { StemTemplate } from '../../types'

export const moonPhaseTemplate: StemTemplate = {
  id: 'science.moon.phase',
  track: 'science',
  level: 'cadet',
  eventTypes: ['generic'],
  titleTemplate: 'Moon Phase Identification',
  briefingTemplate: 'Identify the correct moon phase from illumination.',
  stepBuilder: () => [
    {
      id: 'phase',
      prompt: 'If more than half the Moon is illuminated and growing, what phase is it?',
      inputType: 'choice',
      choices: ['Waxing Gibbous', 'Waning Crescent', 'New Moon'],
    },
  ],
  gradingMode: 'auto',
  expectedAnswerBuilder: () => ({
    type: 'choice',
    value: 'Waxing Gibbous',
  }),
  tags: ['moon', 'astronomy'],
  learningObjectives: ['Recognize common moon phases by illumination.'],
}
