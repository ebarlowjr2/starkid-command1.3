import type { Lesson } from '../models/lesson'

// Flagship "wow mission" module: Artemis III Docking Challenge.
// Educational simulation inspired by NASA's current Artemis planning (Artemis III as a rendezvous/docking test in 2027).
export const artemisDockingChallengeLesson: Lesson = {
  id: 'lesson_artemis_docking_challenge_v1',
  slug: 'space.artemis.docking-challenge',
  title: 'Artemis III Docking Challenge',
  subtitle: 'Run a rendezvous/docking readiness check like Mission Control.',
  summary:
    'Review mission conditions, calculate approach timing, evaluate docking readiness, and submit a GO / HOLD / ABORT recommendation.',
  track: 'science',
  moduleType: 'stem',
  difficulty: 'explorer',
  estimatedMinutes: 15,
  skills: ['systems thinking', 'relative motion', 'decision making', 'mission safety'],
  tags: ['Artemis', 'Orion', 'Docking', 'Mission Planning', 'STEM'],
  sourceEvent: {
    type: 'launch',
    referenceId: 'nasa:artemis-iii:planning',
    label: 'Inspired by current Artemis planning (estimate)',
  },
  objective:
    'Calculate a safe approach timing check, evaluate simplified telemetry, and submit a docking recommendation for Command review.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'block-brief-1',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'You are a junior mission controller supporting an Artemis III-style rendezvous and docking test. Your job is to verify conditions are within limits and recommend whether the crew should proceed.',
      context:
        'This is an educational simulation inspired by current Artemis planning. It is not an official NASA mission simulator and does not represent real-time operational data.',
      stats: ['Scenario target: late 2027 (estimate)', 'Role: Junior Mission Controller', 'Decision: GO / HOLD / ABORT'],
    },
    {
      id: 'block-concept-1',
      type: 'concept',
      order: 2,
      title: 'Vehicle Systems Overview',
      body:
        'Docking is a systems problem. Even when the approach path looks good, Mission Control must confirm multiple systems are stable before committing to contact.',
      bullets: [
        'Orion: crew vehicle + navigation and control',
        'Docking target: commercial spacecraft used for integrated operations testing',
        'Navigation: relative position + approach rate must be stable',
        'Communications: continuous link (or planned handoffs) during approach',
        'Power + crew safety: “nominal” is required to proceed',
      ],
    },
    {
      id: 'block-instruction-1',
      type: 'instruction',
      order: 3,
      steps: [
        'Review the rendezvous basics: distance, closing rate, and timing.',
        'Use the simple check: time (seconds) = distance (meters) ÷ closing rate (m/s).',
        'Keep approach speed within the limit before contact.',
      ],
      workedExample: {
        problem: 'If Orion is 120 m from the docking target and closing at 0.15 m/s, how long until contact (if the rate stayed constant)?',
        solution: 'Time = 120 ÷ 0.15 = 800 seconds (about 13 min 20 sec).',
        steps: ['Divide distance by closing rate.', 'Convert seconds to minutes if needed for reporting.'],
      },
    },
    {
      id: 'block-question-1',
      type: 'question_numeric',
      order: 4,
      prompt:
        'Orion is 90 m from the docking target and closing at 0.18 m/s. About how many seconds until contact (if the rate stayed constant)?',
      unit: 'seconds',
      hint: 'Use time = distance ÷ rate. Example: 90 ÷ 0.18.',
      answer: { value: 500, tolerance: 20 },
      inputLabel: 'Time to contact',
      explanation: '90 ÷ 0.18 = 500 seconds (about 8 min 20 sec).',
    },
    {
      id: 'block-question-2',
      type: 'question_multiple_choice',
      order: 5,
      prompt:
        'Docking Readiness Check — review the telemetry and choose the safest recommendation:\n\n' +
        '• Navigation: stable lock\n' +
        '• Communications: intermittent (3/5 signal)\n' +
        '• Approach speed: 0.22 m/s (limit 0.20 m/s)\n' +
        '• Power: nominal (82%)\n' +
        '• Crew status: nominal\n',
      choices: [
        { id: 'go', text: 'GO — proceed with docking' },
        { id: 'hold', text: 'HOLD — pause and correct conditions' },
        { id: 'abort', text: 'ABORT — terminate the docking attempt' },
      ],
      answerId: 'hold',
      correctFeedback:
        'Correct: HOLD. Approach speed is above the limit and comms are intermittent. Stabilize conditions before contact.',
      incorrectFeedback:
        'Not quite. Check the approach speed limit and comm stability before committing to docking.',
    },
    {
      id: 'block-question-3',
      type: 'question_short_text',
      order: 6,
      prompt:
        'Reflection: In one or two sentences, why do rendezvous and docking tests matter before more complex missions?',
      exampleAnswer:
        'Docking tests prove integrated operations and safety checks work under pressure, reducing risk before committing crews to more complex objectives.',
    },
    {
      id: 'block-submit-1',
      type: 'submission_prompt',
      order: 7,
      prompt: 'Final Mission Submission — send your docking recommendation to Command.',
      instruction:
        'Complete the final checkpoint questions, then submit. XP is awarded on first completion.',
      checkpointQuiz: {
        title: '5-Question Checkpoint',
        questions: [
          {
            id: 'q1',
            type: 'true_false',
            prompt: 'True/False: If approach speed exceeds the limit, Mission Control should HOLD rather than GO.',
            choices: [
              { id: 'true', text: 'True' },
              { id: 'false', text: 'False' },
            ],
            answerId: 'true',
          },
          {
            id: 'q2',
            type: 'multiple_choice',
            prompt: 'Which system area is MOST directly related to maintaining a stable closing rate?',
            choices: [
              { id: 'nav', text: 'Navigation / Guidance' },
              { id: 'power', text: 'Power' },
              { id: 'crew', text: 'Crew status' },
            ],
            answerId: 'nav',
          },
          {
            id: 'q3',
            type: 'numeric',
            prompt: 'Quick check: 60 m at 0.20 m/s takes about how many seconds?',
            unit: 'seconds',
            answer: { value: 300, tolerance: 20 },
          },
          {
            id: 'q4',
            type: 'multiple_choice',
            prompt: 'Decision: Comms drop to 1/5 and nav is stable. What is the safest call?',
            choices: [
              { id: 'go', text: 'GO' },
              { id: 'hold', text: 'HOLD' },
              { id: 'abort', text: 'ABORT' },
            ],
            answerId: 'hold',
          },
          {
            id: 'q5',
            type: 'short_text',
            prompt: 'In one sentence, explain why docking requires teamwork across multiple systems.',
            exampleAnswer:
              'Because docking safety depends on navigation, comms, power, and crew readiness all staying within limits at the same time.',
          },
        ],
      },
      completionMessage:
        'Submission received. Your Artemis docking recommendation has been logged for Command review.',
      completionNextSteps: ['Return to STEM Activities', 'Try another scenario mission'],
    },
  ],
  rewards: {
    badgeId: 'badge-artemis-docking',
    xp: 150,
  },
  createdAt: '2026-05-21T00:00:00Z',
  updatedAt: '2026-05-21T00:00:00Z',
}

