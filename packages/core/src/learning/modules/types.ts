import type { StemActivity, StemLevel, StemTrack } from '../stem/types'

export type LearningModuleType = 'stem' | 'cyberlab' | 'ai' | 'linux' | 'science'

export type LearningModule = StemActivity & {
  moduleType: LearningModuleType
  track?: StemTrack
  level?: StemLevel
  tags?: string[]
  answerKey?: string
  xpReward?: number
  status?: 'draft' | 'in_review' | 'approved' | 'published' | 'archived'
  submittedForReviewAt?: string
  publishedAt?: string
  archivedAt?: string
}

export type LearningProgress = {
  id: string
  userId: string
  moduleId: string
  lessonSlug?: string | null
  status: 'not_started' | 'in_progress' | 'submitted' | 'completed'
  currentStepIndex: number
  totalSteps: number
  answers: Record<string, unknown>
  xpAwarded?: boolean
  xpAwardedAt?: string | null
  startedAt?: string
  lastActivityAt?: string
  completedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type LearningSubmission = {
  id: string
  userId: string
  moduleId: string
  lessonSlug?: string | null
  answers: Record<string, unknown>
  status: 'submitted'
  submittedAt: string
}
