import type { Lesson } from '../models/lesson'

export const launchWindowCountdownLesson: Lesson = {
  id: 'lesson_launch_window_countdown_v1',
  slug: 'math.launch.window-countdown',
  title: 'Launch Window Countdown Solver',
  subtitle: 'Calculate the safest launch timing for mission alignment.',
  summary:
    'Compute time remaining before a launch window closes and recommend whether the launch can proceed.',
  track: 'math',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 5,
  skills: ['time arithmetic', 'mission planning'],
  tags: ['launch', 'countdown', 'window', 'math'],
  sourceEvent: {
    type: 'launch',
    referenceId: 'mission:launch:window',
    label: 'Launch window timing check',
  },
  objective: 'Use time-based math to determine whether the launch window remains valid.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'lw-mission-brief',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'Mission Control needs to confirm whether the vehicle can launch inside a limited window. Your job is to calculate the remaining countdown time and determine if the launch can proceed.',
      context:
        'A launch window is a limited period when conditions are acceptable. If the countdown pushes past window close, the mission must scrub or recycle.',
      stats: ['Window length: 30 minutes', 'Hold time (if needed): 5 minutes'],
    },
    {
      id: 'lw-concept',
      type: 'concept',
      order: 2,
      title: 'What Is a Launch Window?',
      body:
        'A launch window is the timeframe when a rocket can safely launch and still meet mission constraints (trajectory, range safety, lighting, and operations).',
      bullets: [
        'Windows can be minutes or hours long',
        'Countdown holds reduce time remaining',
        'A “go/no-go” decision depends on remaining margin',
      ],
    },
    {
      id: 'lw-instruction',
      type: 'instruction',
      order: 3,
      steps: [
        'Identify the time remaining until window close.',
        'Subtract any planned hold time.',
        'Compare remaining time against a required minimum margin.',
      ],
      workedExample: {
        problem:
          'If the window closes in 18 minutes and a 5-minute hold is required, how much time remains?',
        solution: '18 − 5 = 13 minutes remain.',
        steps: ['Compute remaining time.', 'Subtract planned holds.', 'State remaining margin.'],
      },
    },
    {
      id: 'lw-question-numeric',
      type: 'question_numeric',
      order: 4,
      prompt:
        'The window closes in 22 minutes. A hold of 5 minutes is required. How many minutes remain after the hold?',
      unit: 'min',
      hint: 'Subtract hold time from time remaining: 22 − 5.',
      answer: { value: 17, tolerance: 0 },
      inputLabel: 'Minutes remaining',
      explanation: '22 − 5 = 17 minutes remain.',
    },
    {
      id: 'lw-question-text',
      type: 'question_short_text',
      order: 5,
      prompt:
        'Based on your calculation, should Mission Control proceed if the minimum required margin is 10 minutes? Explain briefly.',
      answer: {
        accepted: [
          'yes',
          'proceed',
          'go',
          '17 is greater than 10',
          'margin is above minimum',
        ],
      },
      exampleAnswer: 'Yes — 17 minutes remain, which is above the 10-minute minimum margin.',
    },
    {
      id: 'lw-checkpoint',
      type: 'checkpoint',
      order: 6,
      prompt: 'Checkpoint: confirm remaining time is above the minimum margin.',
      criteria: ['Remaining time ≥ 10 minutes'],
    },
    {
      id: 'lw-submit',
      type: 'submission_prompt',
      order: 7,
      prompt: 'Submit your launch timing decision to Command.',
      instruction: 'Double-check subtraction and margin requirement.',
      completionMessage: 'Decision logged. Mission Control can proceed with the timing call.',
      completionNextSteps: ['Check upcoming launch feeds', 'Review mission constraints'],
    },
  ],
  rewards: {
    badgeId: 'badge-launch-window',
    xp: 50,
  },
  createdAt: '2026-05-03T00:00:00Z',
  updatedAt: '2026-05-03T00:00:00Z',
}

