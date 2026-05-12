import type { Lesson } from '../models/lesson'

export const solarStormShieldingLesson: Lesson = {
  id: 'lesson_solar_storm_shielding_v1',
  slug: 'science.solar.storm-shielding',
  title: 'Solar Storm Shielding Decision',
  subtitle: 'Decide when a crew should shelter from solar radiation.',
  summary:
    'Review simplified radiation readings against a safety threshold and recommend whether the crew should shelter.',
  track: 'science',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 6,
  skills: ['threshold comparison', 'risk reasoning'],
  tags: ['space-weather', 'radiation', 'safety', 'science'],
  sourceEvent: { type: 'solar', referenceId: 'event:solar:storm', label: 'Elevated solar activity' },
  objective: 'Compare readings against a safety threshold and make a mission safety recommendation.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'ss-brief',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'Space weather monitors report an increase in solar activity. The crew needs a recommendation on whether to continue normal operations or move to a shielded area.',
      context:
        'During solar storms, radiation can increase quickly. Shelter protocols reduce exposure by moving to better-shielded areas of the vehicle.',
      stats: ['Safety threshold: 2.0 mSv/hr', 'Current reading: 2.4 mSv/hr'],
    },
    {
      id: 'ss-concept',
      type: 'concept',
      order: 2,
      title: 'Radiation Risk (Simplified)',
      body:
        'For this mission, use a simple threshold rule. If the radiation rate exceeds the safety threshold, recommend shelter protocol.',
      bullets: [
        'Rate is measured in mSv/hr',
        'Higher rate means higher exposure per hour',
        'Use the threshold to decide quickly',
      ],
    },
    {
      id: 'ss-instruction',
      type: 'instruction',
      order: 3,
      steps: [
        'Read the current radiation rate.',
        'Compare it to the safety threshold.',
        'State a shelter or continue recommendation.',
      ],
      workedExample: {
        problem: 'Threshold is 2.0 mSv/hr. Reading is 1.7 mSv/hr. What is the recommendation?',
        solution: 'Continue normal operations (below threshold).',
        steps: ['Compare 1.7 vs 2.0.', 'Below threshold → continue.'],
      },
    },
    {
      id: 'ss-question-numeric',
      type: 'question_numeric',
      order: 4,
      prompt:
        'Safety threshold is 2.0 mSv/hr. Current rate is 2.4 mSv/hr. By how much does the reading exceed the threshold?',
      unit: 'mSv/hr',
      hint: 'Subtract: 2.4 − 2.0.',
      answer: { value: 0.4, tolerance: 0.05 },
      inputLabel: 'Exceeds by',
      explanation: '2.4 − 2.0 = 0.4 mSv/hr above threshold.',
    },
    {
      id: 'ss-question-text',
      type: 'question_short_text',
      order: 5,
      prompt:
        'Should the crew enter shelter protocol? Explain briefly using the threshold rule.',
      answer: { accepted: ['yes', 'shelter', 'above', 'threshold', '2.4', '2.0'] },
      exampleAnswer: 'Yes — 2.4 mSv/hr is above the 2.0 mSv/hr threshold, so shelter protocol is recommended.',
    },
    {
      id: 'ss-checkpoint',
      type: 'checkpoint',
      order: 6,
      prompt: 'Checkpoint: confirm your recommendation matches the threshold rule.',
      criteria: ['If rate > threshold → shelter', 'If rate ≤ threshold → continue'],
    },
    {
      id: 'ss-submit',
      type: 'submission_prompt',
      order: 7,
      prompt: 'Submit your shielding decision to Command.',
      instruction: 'Make sure your recommendation is consistent with the threshold.',
      completionMessage: 'Decision logged. Crew safety posture updated.',
      completionNextSteps: ['Monitor space weather', 'Review radiation shelter locations'],
    },
  ],
  rewards: { badgeId: 'badge-space-weather', xp: 60 },
  createdAt: '2026-05-03T00:00:00Z',
  updatedAt: '2026-05-03T00:00:00Z',
}

