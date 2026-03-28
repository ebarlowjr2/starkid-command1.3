import type { StemActivity, StemLevel, StemTrack } from '../stem/types'

export type LearningModuleType = 'stem' | 'cyberlab' | 'ai' | 'linux' | 'science'

export type LearningModule = StemActivity & {
  moduleType: LearningModuleType
  track?: StemTrack
  level?: StemLevel
  tags?: string[]
  answerKey?: string
  status?: 'draft' | 'in_review' | 'approved' | 'published' | 'archived'
  submittedForReviewAt?: string
  publishedAt?: string
  archivedAt?: string
}
