import type { AlertPreference, UserProfile, UserRank } from './types'
function defaultAlerts(): AlertPreference {
  return {
    spaceWeather: true,
    asteroidFlybys: true,
    missionAlerts: true,
    lunarEvents: true,
    launches: true,
    stemRecommendations: true,
  }
}

function defaultName(rank: UserRank) {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000)
  return `${rank}-${suffix}`
}

export function getDefaultProfile(actorId: string): UserProfile {
  const rank: UserRank = 'Cadet'
  return {
    actorId,
    displayName: defaultName(rank),
    rank,
    joinedAt: new Date().toISOString(),
    alertPreferences: defaultAlerts(),
    savedCounts: {
      nearEarthObjects: 0,
      comets: 0,
      skyEvents: 0,
      missions: 0,
      activities: 0,
    },
    stats: {
      missionsCompleted: 0,
      activitiesCompleted: 0,
      alertsViewed: 0,
      currentStemLevel: null,
    },
    badges: [],
  }
}
