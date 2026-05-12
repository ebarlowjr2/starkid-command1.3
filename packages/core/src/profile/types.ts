export type UserRank = 'Cadet' | 'Explorer' | 'Specialist' | 'Operator' | 'Commander'

export type SavedObjectType =
  | 'near_earth_object'
  | 'comet'
  | 'sky_event'
  | 'mission'
  | 'activity'

export type AlertPreference = {
  spaceWeather: boolean
  asteroidFlybys: boolean
  missionAlerts: boolean
  lunarEvents: boolean
  launches: boolean
  stemRecommendations: boolean
}

export type UserProfile = {
  actorId: string
  displayName: string
  rank: UserRank
  bio?: string
  joinedAt: string
  avatarType?: string
  alertPreferences: AlertPreference
  savedCounts: {
    nearEarthObjects: number
    comets: number
    skyEvents: number
    missions: number
    activities: number
  }
  stats: {
    missionsCompleted: number
    activitiesCompleted: number
    alertsViewed: number
    currentStemLevel?: string | null
  }
  badges?: string[]
}
