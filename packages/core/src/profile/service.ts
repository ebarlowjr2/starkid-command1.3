import type { UserProfile, UserRank, SavedObjectType, AlertPreference } from './types'
import { getDefaultProfile } from './defaults'
import { getRepos } from '../storage/repos/repoFactory'
import { listTracks, listLevels } from '../learning/stem/service'
import { listStemActivities } from '../learning/stem/service'

const SAVED_TYPES: SavedObjectType[] = [
  'near_earth_object',
  'comet',
  'sky_event',
  'mission',
  'activity',
]

export async function getProfile(): Promise<UserProfile> {
  const { actor, profileRepo, preferencesRepo } = await getRepos()
  const stored = await profileRepo.getProfile(actor.actorId)
  const base = stored || getDefaultProfile(actor.actorId)
  const prefs = await preferencesRepo.get(actor.actorId)
  const alertPreferences: AlertPreference = prefs?.alertPreferences || base.alertPreferences
  const summary = await getSavedObjectsSummary()
  const missionSummary = await getMissionHistorySummary()
  const stemSummary = await getStemProgressSummary()
  const rank = await recalculateRank()

  const profile: UserProfile = {
    ...base,
    alertPreferences,
    savedCounts: summary,
    stats: {
      missionsCompleted: missionSummary.completed,
      activitiesCompleted: stemSummary.completed,
      alertsViewed: base.stats?.alertsViewed || 0,
      currentStemLevel: stemSummary.currentLevel || null,
    },
    rank,
  }

  await profileRepo.saveProfile(actor.actorId, profile)
  return profile
}

export async function updateProfile(patch: Partial<UserProfile>) {
  const { actor, profileRepo, preferencesRepo } = await getRepos()
  const updated = await profileRepo.updateProfile(actor.actorId, patch)
  if (patch.alertPreferences) {
    await preferencesRepo.set(actor.actorId, { alertPreferences: patch.alertPreferences })
  }
  return updated
}

export async function getUserRank(): Promise<UserRank> {
  return recalculateRank()
}

export async function recalculateRank(): Promise<UserRank> {
  const missionSummary = await getMissionHistorySummary()
  const stemSummary = await getStemProgressSummary()
  const total = missionSummary.completed + stemSummary.completed
  const tracksCompleted = new Set(stemSummary.completedTracks)

  if (total >= 15 && tracksCompleted.size >= 2) return 'Operator'
  if (total >= 8) return 'Specialist'
  if (stemSummary.completed >= 3 || missionSummary.completed >= 2) return 'Explorer'
  return 'Cadet'
}

export async function getSavedObjectsSummary() {
  const { actor, savedItemsRepo } = await getRepos()
  const counts = {
    nearEarthObjects: 0,
    comets: 0,
    skyEvents: 0,
    missions: 0,
    activities: 0,
  }

  for (const type of SAVED_TYPES) {
    const items = await savedItemsRepo.list(actor.actorId, type)
    switch (type) {
      case 'near_earth_object':
        counts.nearEarthObjects = items.length
        break
      case 'comet':
        counts.comets = items.length
        break
      case 'sky_event':
        counts.skyEvents = items.length
        break
      case 'mission':
        counts.missions = items.length
        break
      case 'activity':
        counts.activities = items.length
        break
    }
  }

  return counts
}

export async function getMissionHistorySummary() {
  const { actor, missionsRepo } = await getRepos()
  const completed = await missionsRepo.listCompleted(actor.actorId)
  const attempts = await missionsRepo.listAttempts(actor.actorId)
  return {
    completed: completed.length,
    attempts: attempts.length,
  }
}

export async function getStemProgressSummary() {
  const { actor, stemProgressRepo } = await getRepos()
  const completions = await stemProgressRepo.listCompleted(actor.actorId)
  const activities = listStemActivities()
  const completedIds = new Set(completions.map((c) => c.activityId))
  const completed = completions.length

  const trackStats = listTracks().map((track) => {
    const trackActivities = activities.filter((a) => a.track === track)
    const trackCompleted = trackActivities.filter((a) => completedIds.has(a.id)).length
    return { track, completed: trackCompleted, total: trackActivities.length }
  })

  const completedTracks = trackStats.filter((t) => t.completed > 0).map((t) => t.track)
  const currentLevel = listLevels().find((level) => {
    const levelActivities = activities.filter((a) => a.level === level)
    return levelActivities.length > 0 && levelActivities.every((a) => completedIds.has(a.id))
  }) || null

  return { completed, trackStats, completedTracks, currentLevel }
}
