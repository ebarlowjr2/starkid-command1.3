import type { Lesson } from '../models/lesson'

export const lunarOxygenSupplyLesson: Lesson = {
  id: 'lesson_lunar_oxygen_supply_v1',
  slug: 'math.lunar.oxygen-supply',
  title: 'Lunar Oxygen Supply Estimator',
  subtitle: 'Estimate oxygen reserves for a lunar surface mission.',
  summary:
    'Calculate total oxygen demand based on crew size, hourly use, and mission duration, then recommend whether reserves are safe.',
  track: 'math',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 6,
  skills: ['multiplication', 'unit reasoning', 'safety margins'],
  tags: ['lunar', 'life-support', 'oxygen', 'math'],
  sourceEvent: { type: 'generic', referenceId: 'mission:lunar:oxygen', label: 'Lunar EVA planning' },
  objective: 'Calculate total oxygen consumption and verify reserves support mission duration with margin.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'ox-brief',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'A lunar surface crew must verify that their oxygen reserves can support the planned mission duration. You are assigned to calculate whether the current supply is enough for the crew.',
      context:
        'Life support planning uses conservative estimates. A small shortfall can end a mission early or create emergency risk.',
      stats: ['Crew: 4', 'Use rate: 0.9 kg/hr per astronaut', 'Reserve: 20 kg'],
    },
    {
      id: 'ox-concept',
      type: 'concept',
      order: 2,
      title: 'Oxygen Budget Basics',
      body:
        'Total oxygen required depends on crew size, hourly consumption, and duration. Mission planners also want safety margin for delays.',
      bullets: [
        'Total = crew × rate × hours',
        'Add margin when possible',
        'Compare total demand vs stored supply',
      ],
    },
    {
      id: 'ox-instruction',
      type: 'instruction',
      order: 3,
      steps: [
        'Multiply hourly use by crew size to get total hourly demand.',
        'Multiply hourly demand by mission hours.',
        'Compare the result to oxygen available.',
      ],
      workedExample: {
        problem: '3 astronauts use 1.0 kg/hr each for 4 hours. How much oxygen is needed?',
        solution: 'Total = 3 × 1.0 × 4 = 12 kg.',
        steps: ['Compute hourly demand.', 'Multiply by duration.', 'State total needed.'],
      },
    },
    {
      id: 'ox-question-numeric',
      type: 'question_numeric',
      order: 4,
      prompt:
        'Crew size is 4. Each astronaut uses 0.9 kg/hr. Mission duration is 5 hours. How many kilograms of oxygen are required?',
      unit: 'kg',
      hint: 'Total = crew × rate × hours = 4 × 0.9 × 5.',
      answer: { value: 18, tolerance: 0.5 },
      inputLabel: 'Total oxygen required',
      explanation: '4 × 0.9 × 5 = 18 kg required.',
    },
    {
      id: 'ox-question-text',
      type: 'question_short_text',
      order: 5,
      prompt:
        'If the reserve is 20 kg, is the oxygen supply safe? Mention why margin matters.',
      answer: { accepted: ['yes', 'safe', '20', '18', 'margin'] },
      exampleAnswer:
        'Yes — 18 kg are required and 20 kg are available, leaving a 2 kg margin for delays or higher-than-expected use.',
    },
    {
      id: 'ox-checkpoint',
      type: 'checkpoint',
      order: 6,
      prompt: 'Checkpoint: confirm supply exceeds demand.',
      criteria: ['Supply ≥ demand'],
    },
    {
      id: 'ox-submit',
      type: 'submission_prompt',
      order: 7,
      prompt: 'Submit your oxygen budget recommendation to Command.',
      instruction: 'Double-check units and multiplication.',
      completionMessage: 'Oxygen budget logged. Crew planning can proceed.',
      completionNextSteps: ['Review EVA timeline', 'Check power and water budgets'],
    },
  ],
  rewards: { badgeId: 'badge-lunar-life-support', xp: 60 },
  createdAt: '2026-05-03T00:00:00Z',
  updatedAt: '2026-05-03T00:00:00Z',
}

