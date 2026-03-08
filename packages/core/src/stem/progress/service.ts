import type { StemActivity, StemMission, StemTrack } from '../types'
import type { StemActivityCompletion, StemProgressOverview } from './types'
import { getRepos } from '../../storage/repos/repoFactory.ts'
import { listStemActivities } from '../service'
import { calculateTrackProgress, getRecommendedNextActivity } from './calculators'

async function loadCompletions(): Promise<StemActivityCompletion[]> {
  const { stemProgressRepo, actor } = await getRepos()
  const completed = await stemProgressRepo.listCompleted(actor.actorId)
  const activities = listStemActivities()
  return (completed || []).map((item: any) => {
    if (typeof item === 'string') {
      const activity = activities.find((a) => a.id === item)
      return {
        activityId: item,
        title: activity?.title || item,
        track: activity?.track || 'science',
        level: activity?.level || 'cadet',
        completedAt: new Date().toISOString(),
      }
    }
    return item as StemActivityCompletion
  })
}

export async function listCompletedStemActivities() {
  return loadCompletions()
}

export async function isStemActivityCompleted(activityId: string) {
  const { stemProgressRepo, actor } = await getRepos()
  return stemProgressRepo.isCompleted(actor.actorId, activityId)
}

export async function markStemActivityCompleted(activityId: string, activity?: StemActivity) {
  const { stemProgressRepo, actor } = await getRepos()
  const completions = await loadCompletions()
  const exists = completions.find((item) => item.activityId === activityId)
  if (exists) return exists

  const activityData = activity ?? listStemActivities().find((item) => item.id === activityId)
  if (!activityData) {
    throw new Error('Unknown STEM activity')
  }

  const completion: StemActivityCompletion = {
    activityId,
    title: activityData.title,
    track: activityData.track,
    level: activityData.level,
    completedAt: new Date().toISOString(),
  }

  await stemProgressRepo.markCompleted(actor.actorId, completion)
  return completion
}

export async function syncMissionCompletionToActivity(mission: StemMission) {
  if (!mission?.linkedActivityId) return { created: false }
  const existing = await isStemActivityCompleted(mission.linkedActivityId)
  if (existing) return { created: false }
  await markStemActivityCompleted(mission.linkedActivityId)
  return { created: true, activityId: mission.linkedActivityId }
}

export async function getStemProgressOverview(): Promise<StemProgressOverview> {
  const activities = listStemActivities()
  const completions = await loadCompletions()
  const recentCompletions = [...completions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )
  const tracks: StemTrack[] = ['math', 'science', 'cyber', 'linux', 'ai']
  const trackProgress = tracks.map((track) => calculateTrackProgress(track, activities, completions))

  return {
    tracks: trackProgress,
    recentCompletions: recentCompletions.slice(0, 5),
    recommendedNextActivity: getRecommendedNextActivity(activities, completions),
  }
}
