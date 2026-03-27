import type { Lesson } from '../models/lesson'

export const launchFuelRatioLesson: Lesson = {
  id: 'lesson_launch_fuel_ratio_v1',
  slug: 'launch-fuel-ratio-calculation',
  title: 'Launch Fuel Ratio Calculation',
  subtitle: 'Mission math for stable liftoff performance',
  summary:
    'Calculate a safe oxidizer-to-fuel ratio for a launch stage and verify the mix meets thrust and efficiency targets.',
  track: 'math',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 12,
  skills: ['ratios', 'unit conversion', 'mission planning'],
  tags: ['launch', 'propulsion', 'math', 'fuel'],
  sourceEvent: {
    type: 'launch',
    referenceId: 'mission:launch:demo',
    label: 'Example launch window',
  },
  objective:
    'Determine the required oxidizer-to-fuel mix to hit a target thrust ratio while staying within safe limits.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'block-brief-1',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'A new launch stage is ready for test. Your job is to calculate a safe oxidizer-to-fuel ratio (O/F) so the engine delivers stable thrust without over-heating.',
      context:
        'O/F ratio is the mass of oxidizer divided by the mass of fuel. A ratio that is too high can overheat; too low can cause incomplete combustion.',
      stats: ['Target thrust ratio: 2.6', 'Safe O/F window: 2.2–3.0'],
    },
    {
      id: 'block-concept-1',
      type: 'concept',
      order: 2,
      title: 'Understanding O/F Ratio',
      body:
        'The oxidizer-to-fuel ratio (O/F) tells you how much oxidizer you need for every unit of fuel. Rocket engines have an optimal O/F that balances thrust, efficiency, and temperature.',
      bullets: [
        'O/F = oxidizer mass ÷ fuel mass',
        'Higher O/F = hotter burn, more thrust risk',
        'Lower O/F = cooler burn, less thrust',
      ],
    },
    {
      id: 'block-instruction-1',
      type: 'instruction',
      order: 3,
      steps: [
        'Read the target thrust ratio and safe O/F window.',
        'Compute the required oxidizer mass for the given fuel mass.',
        'Check that your ratio stays inside the safe window.',
      ],
    },
    {
      id: 'block-example-1',
      type: 'worked_example',
      order: 4,
      problem:
        'If the fuel mass is 500 kg and the target O/F ratio is 2.4, how much oxidizer is required?',
      solution:
        'Oxidizer = fuel × O/F = 500 × 2.4 = 1200 kg.',
      steps: ['Multiply fuel mass by the target ratio.', 'Confirm the ratio is within the safe window.'],
    },
    {
      id: 'block-question-1',
      type: 'question_numeric',
      order: 5,
      prompt:
        'Fuel mass is 600 kg. The target O/F ratio is 2.6. How much oxidizer is required (in kg)?',
      unit: 'kg',
      hint: 'Multiply the fuel mass by the O/F ratio. Example: 600 × 2.6.',
      answer: { value: 1560, tolerance: 5 },
      inputLabel: 'Oxidizer mass',
      explanation: 'Oxidizer = 600 × 2.6 = 1560 kg.',
    },
    {
      id: 'block-question-2',
      type: 'question_short_text',
      order: 6,
      prompt:
        'Why must the O/F ratio stay inside the safe window during launch?',
      answer: {
        accepted: [
          'to avoid overheating and unstable combustion',
          'to prevent overheating',
          'to keep combustion stable',
        ],
      },
      exampleAnswer: 'To avoid overheating and keep combustion stable.',
    },
    {
      id: 'block-checkpoint-1',
      type: 'checkpoint',
      order: 7,
      prompt: 'Checkpoint: confirm your computed ratio is within 2.2–3.0.',
      criteria: ['Computed O/F ratio between 2.2 and 3.0'],
    },
    {
      id: 'block-submit-1',
      type: 'submission_prompt',
      order: 8,
      prompt: 'Submit your launch fuel calculation for review.',
      instruction: 'Double-check units and safety window before submitting.',
    },
    {
      id: 'block-complete-1',
      type: 'completion',
      order: 9,
      message: 'Great work. Your fuel ratio plan is ready for mission review.',
      nextSteps: ['Review launch timeline', 'Open Mission Briefing for next steps'],
    },
  ],
  rewards: {
    badgeId: 'badge-launch-math',
    xp: 50,
  },
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
}
