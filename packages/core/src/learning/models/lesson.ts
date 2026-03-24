import type { LessonBlock } from './blocks'
import type { LessonStatus } from './status'

export type LessonModuleType = 'stem' | 'cyberlab' | 'future'
export type LessonTrack = 'math' | 'science' | 'cyber' | 'linux' | 'ai' | 'general'
export type LessonDifficulty = 'cadet' | 'explorer' | 'specialist' | 'operator'

export type LessonSourceEvent = {
  type: string
  referenceId?: string
  label?: string
}

export type LessonReward = {
  badgeId?: string
  xp?: number
}

export type Lesson = {
  id: string
  slug: string
  title: string
  subtitle: string
  summary: string
  track: LessonTrack
  moduleType: LessonModuleType
  difficulty: LessonDifficulty
  estimatedMinutes: number
  skills: string[]
  tags: string[]
  sourceEvent?: LessonSourceEvent
  objective: string
  status: LessonStatus
  version: string
  blocks: LessonBlock[]
  rewards?: LessonReward
  createdAt: string
  updatedAt: string
}
