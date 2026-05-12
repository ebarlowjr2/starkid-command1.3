import type { Lesson } from '../models/lesson'

export const marsRoverBatteryLesson: Lesson = {
  id: 'lesson_mars_rover_battery_budget_v1',
  slug: 'math.mars.rover-battery-budget',
  title: 'Mars Rover Battery Budget',
  subtitle: 'Balance rover power use during a surface operation.',
  summary:
    'Add power costs for rover tasks and compare them against available battery to recommend whether the plan is safe.',
  track: 'math',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 7,
  skills: ['addition', 'budgeting', 'margin reasoning'],
  tags: ['mars', 'rover', 'power', 'math'],
  sourceEvent: { type: 'generic', referenceId: 'mission:mars:rover', label: 'Surface operations plan' },
  objective: 'Calculate total energy use and determine whether the mission plan stays within the battery budget.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'mr-brief',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'A Mars rover has limited battery capacity for a planned drive, camera scan, and communications pass. You must calculate whether the planned operation can be completed safely.',
      context:
        'Rovers need energy margin for unexpected terrain, delays, or additional comms. A low battery can strand the vehicle or end science operations early.',
      stats: ['Battery available: 100 Wh', 'Drive: 45 Wh', 'Camera scan: 22 Wh', 'Comms pass: 18 Wh'],
    },
    {
      id: 'mr-concept',
      type: 'concept',
      order: 2,
      title: 'Battery Budgeting',
      body:
        'A mission plan is safe if total task energy is less than available battery. The remaining battery is your margin.',
      bullets: ['Total = sum of tasks', 'Remaining = available − total', 'Margin helps handle surprises'],
    },
    {
      id: 'mr-instruction',
      type: 'instruction',
      order: 3,
      steps: [
        'Add the energy costs for each planned task.',
        'Subtract from total available battery.',
        'Decide if the plan is safe and state remaining margin.',
      ],
      workedExample: {
        problem: 'Available 80 Wh. Tasks cost 20 Wh and 35 Wh. Is the plan safe?',
        solution: 'Total 55 Wh. Remaining 25 Wh. Yes, safe.',
        steps: ['Add tasks.', 'Subtract from available.', 'Report remaining margin.'],
      },
    },
    {
      id: 'mr-question-numeric',
      type: 'question_numeric',
      order: 4,
      prompt:
        'Battery available is 100 Wh. Planned tasks: Drive 45 Wh, Camera 22 Wh, Comms 18 Wh. How many Wh remain after completing all tasks?',
      unit: 'Wh',
      hint: 'Add the tasks, then subtract from 100 Wh.',
      answer: { value: 15, tolerance: 0 },
      inputLabel: 'Remaining battery',
      explanation: '45 + 22 + 18 = 85 Wh used. 100 − 85 = 15 Wh remaining.',
    },
    {
      id: 'mr-question-text',
      type: 'question_short_text',
      order: 5,
      prompt:
        'Would you recommend proceeding with only 15 Wh margin? Explain briefly.',
      answer: { accepted: ['margin', 'risk', 'yes', 'no', 'reduce', 'proceed'] },
      exampleAnswer:
        'Recommendation: proceed with caution or reduce a task. A 15 Wh margin is small and leaves little room for delays or extra power use.',
    },
    {
      id: 'mr-checkpoint',
      type: 'checkpoint',
      order: 6,
      prompt: 'Checkpoint: confirm total energy used does not exceed available battery.',
      criteria: ['Total used ≤ available'],
    },
    {
      id: 'mr-submit',
      type: 'submission_prompt',
      order: 7,
      prompt: 'Submit your rover power recommendation to Command.',
      instruction: 'Double-check addition and remaining battery.',
      completionMessage: 'Power budget logged. Rover operations can be adjusted.',
      completionNextSteps: ['Review next sols plan', 'Check thermal constraints'],
    },
  ],
  rewards: { badgeId: 'badge-rover-ops', xp: 70 },
  createdAt: '2026-05-03T00:00:00Z',
  updatedAt: '2026-05-03T00:00:00Z',
}

