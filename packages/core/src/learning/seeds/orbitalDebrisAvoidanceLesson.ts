import type { Lesson } from '../models/lesson'

export const orbitalDebrisAvoidanceLesson: Lesson = {
  id: 'lesson_orbital_debris_avoidance_v1',
  slug: 'science.orbit.debris-avoidance',
  title: 'Orbital Debris Avoidance Check',
  subtitle: 'Assess whether a spacecraft should perform an avoidance maneuver.',
  summary:
    'Compare predicted miss distance against a safety threshold and recommend whether Command should initiate an avoidance burn.',
  track: 'science',
  moduleType: 'stem',
  difficulty: 'cadet',
  estimatedMinutes: 7,
  skills: ['threshold comparison', 'risk reasoning'],
  tags: ['orbit', 'debris', 'safety', 'science'],
  sourceEvent: { type: 'generic', referenceId: 'event:orbit:debris', label: 'Close approach prediction' },
  objective: 'Determine if the predicted close approach is inside the danger zone and recommend go/no-go maneuver.',
  status: 'published',
  version: '1.0.0',
  blocks: [
    {
      id: 'od-brief',
      type: 'mission_brief',
      order: 1,
      heading: 'Mission Brief',
      body:
        'Tracking data shows a piece of orbital debris passing near a spacecraft. You must compare the predicted miss distance against a safety threshold and recommend whether Command should initiate an avoidance burn.',
      context:
        'A small probability of collision can justify an avoidance maneuver if the miss distance is inside a defined safety threshold.',
      stats: ['Safety threshold: 1.0 km', 'Predicted miss distance: 0.6 km'],
    },
    {
      id: 'od-concept',
      type: 'concept',
      order: 2,
      title: 'Close Approaches',
      body:
        'For this exercise, use a simple rule: if predicted miss distance is less than the safety threshold, recommend an avoidance maneuver.',
      bullets: ['Miss distance is how close objects pass', 'Lower distance = higher risk', 'Threshold provides a fast decision'],
    },
    {
      id: 'od-instruction',
      type: 'instruction',
      order: 3,
      steps: ['Read the predicted miss distance.', 'Compare it to the safety threshold.', 'State maneuver recommendation.'],
      workedExample: {
        problem: 'Threshold 1.0 km. Miss distance 1.4 km. What do you recommend?',
        solution: 'No maneuver (miss distance is above threshold).',
        steps: ['Compare 1.4 vs 1.0.', 'Above threshold → no-go for burn.'],
      },
    },
    {
      id: 'od-question-numeric',
      type: 'question_numeric',
      order: 4,
      prompt:
        'Safety threshold is 1.0 km. Predicted miss distance is 0.6 km. How far inside the threshold is the approach?',
      unit: 'km',
      hint: 'Subtract: 1.0 − 0.6.',
      answer: { value: 0.4, tolerance: 0.05 },
      inputLabel: 'Inside threshold by',
      explanation: '1.0 − 0.6 = 0.4 km inside the threshold.',
    },
    {
      id: 'od-question-text',
      type: 'question_short_text',
      order: 5,
      prompt:
        'Should Command perform an avoidance maneuver? Explain briefly using the threshold rule.',
      answer: { accepted: ['yes', 'avoidance', 'maneuver', 'below', 'threshold', '0.6', '1.0'] },
      exampleAnswer: 'Yes — 0.6 km is below the 1.0 km threshold, so an avoidance burn is recommended.',
    },
    {
      id: 'od-checkpoint',
      type: 'checkpoint',
      order: 6,
      prompt: 'Checkpoint: confirm miss distance is inside the danger zone.',
      criteria: ['Miss distance < 1.0 km → maneuver'],
    },
    {
      id: 'od-submit',
      type: 'submission_prompt',
      order: 7,
      prompt: 'Submit your debris avoidance recommendation to Command.',
      instruction: 'Double-check your threshold comparison.',
      completionMessage: 'Recommendation logged. Flight dynamics can plan the burn if required.',
      completionNextSteps: ['Monitor conjunction updates', 'Review burn planning basics'],
    },
  ],
  rewards: { badgeId: 'badge-orbit-safety', xp: 70 },
  createdAt: '2026-05-03T00:00:00Z',
  updatedAt: '2026-05-03T00:00:00Z',
}

