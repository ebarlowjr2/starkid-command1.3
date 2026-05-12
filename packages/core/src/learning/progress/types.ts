import type { StemActivity, StemLevel, StemTrack } from '../stem/types'

export type StemActivityCompletion = {
  activityId: string
  title: string
  track: StemTrack
  level: StemLevel
  completedAt: string
}

export type TrackProgress = {
  track: StemTrack
  completed: number
  total: number
  percent: number
  currentLevel: StemLevel | null
}

export type StemProgressOverview = {
  tracks: TrackProgress[]
  recentCompletions: StemActivityCompletion[]
  recommendedNextActivity?: StemActivity | null
}
