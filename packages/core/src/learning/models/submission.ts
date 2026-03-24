import type { SubmissionStatus } from './status'

export type LessonSubmission = {
  submissionId: string
  lessonId: string
  userId?: string | null
  attemptId: string
  answers: Record<string, unknown>
  status: SubmissionStatus
  submittedAt?: string
  reviewNotes?: string
  score?: number
  metadata?: Record<string, unknown>
}
