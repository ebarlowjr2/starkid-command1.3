import type { StemActivity, StemLevel, StemTrack } from '../types'
import type { StemActivityCompletion, TrackProgress } from './types'

const LEVEL_ORDER: StemLevel[] = ['cadet', 'explorer', 'specialist', 'operator']

export function calculateTrackProgress(
  track: StemTrack,
  activities: StemActivity[],
  completions: StemActivityCompletion[]
): TrackProgress {
  const trackActivities = activities.filter((activity) => activity.track === track)
  const completedIds = new Set(completions.map((completion) => completion.activityId))
  const completedCount = trackActivities.filter((activity) => completedIds.has(activity.id)).length
  const total = trackActivities.length
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

  return {
    track,
    completed: completedCount,
    total,
    percent,
    currentLevel: determineCurrentLevel(trackActivities, completions),
  }
}

export function determineCurrentLevel(
  trackActivities: StemActivity[],
  completions: StemActivityCompletion[]
): StemLevel | null {
  if (!trackActivities.length) return null
  const completedIds = new Set(completions.map((completion) => completion.activityId))
  const levels = [...new Set(trackActivities.map((activity) => activity.level))].sort(
    (a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b)
  )

  let highestCompleted: StemLevel | null = null
  for (const level of levels) {
    const levelActivities = trackActivities.filter((activity) => activity.level === level)
    const allCompleted = levelActivities.every((activity) => completedIds.has(activity.id))
    if (allCompleted) {
      highestCompleted = level
    } else if (!highestCompleted) {
      return level
    }
  }

  return highestCompleted ?? levels[0]
}

export function getRecommendedNextActivity(
  activities: StemActivity[],
  completions: StemActivityCompletion[]
): StemActivity | null {
  if (!activities.length) return null
  const completedIds = new Set(completions.map((completion) => completion.activityId))
  const sorted = [...activities].sort((a, b) => {
    const levelDelta = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
    if (levelDelta !== 0) return levelDelta
    const trackDelta = a.track.localeCompare(b.track)
    if (trackDelta !== 0) return trackDelta
    return a.title.localeCompare(b.title)
  })

  return sorted.find((activity) => !completedIds.has(activity.id)) ?? null
}
