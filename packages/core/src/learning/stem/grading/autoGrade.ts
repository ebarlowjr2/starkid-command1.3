import type { ExpectedAnswer } from '@starkid/types'
import type { StemActivity, StemMission } from '../types'
import { gradeAttempt } from '../../../domain/missions/grading.ts'

type GradeResult = {
  pass: boolean
  score: number
  feedback: string
  hints?: string[]
}

export function gradeStemAttempt(
  activity: StemActivity | StemMission,
  answers: Record<string, unknown>
): GradeResult {
  if (activity.grading !== 'auto' || !activity.expectedAnswer) {
    return { pass: false, score: 0, feedback: 'Manual review required.' }
  }

  const payload = {
    main: answers.main ?? answers[Object.keys(answers)[0]] ?? answers,
  }

  const result = gradeAttempt(
    {
      id: activity.id,
      title: activity.title,
      difficulty: 'easy',
      type: activity.track === 'science' ? 'science' : activity.track,
      briefing: activity.briefing || '',
      requiredData: activity.requiredData || {},
      timeLimit: activity.timeLimit || 0,
      steps: activity.steps,
      grading: activity.grading,
      expectedAnswer: activity.expectedAnswer as ExpectedAnswer,
    },
    payload
  )

  return {
    pass: result.pass,
    score: result.pass ? 1 : 0,
    feedback: result.feedback,
    hints: result.pass ? [] : ['Check units or try again.'],
  }
}
