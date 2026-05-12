export type LessonProgressState = 'not_started' | 'in_progress' | 'submitted' | 'completed'

export type LessonProgress = {
  lessonId: string
  userId?: string | null
  state: LessonProgressState
  startedAt?: string
  lastActivityAt?: string
  completedAt?: string
  attemptCount: number
  completionPercent: number
  rewardId?: string
}
