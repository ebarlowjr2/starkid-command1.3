export type Launch = {
  id?: string | number
  name?: string
  net?: string
  window_start?: string
  providerName?: string
  providerType?: string
  rocketId?: string
  pad?: {
    name?: string
    latitude?: number
    longitude?: number
    location?: {
      name?: string
    }
  }
}

export type SkyEvent = {
  id?: string | number
  title?: string
  type?: string
  start?: string
  end?: string
  description?: string
  visibility?: string
  source?: string
  sourceUrl?: string
  metadata?: Record<string, unknown>
}

export type Comet = {
  designation?: string
  name?: string
  description?: string
  period?: string
  lastPerihelion?: string
  nextPerihelion?: string
  notable?: boolean
  savedAt?: string
  notify?: boolean
}

export type AlertSeverity = 'info' | 'medium' | 'high'

export type AlertCategory =
  | 'launch'
  | 'artemis'
  | 'lunar_event'
  | 'moon_cycle'
  | 'meteor_shower'
  | 'planet_conjunction'
  | 'space_weather'
  | 'asteroid_flyby'
  | 'mission_alert'

export type Alert = {
  id: string
  type: 'launch' | 'sky-event' | 'solar' | string
  category?: AlertCategory
  title: string
  description?: string
  severity: AlertSeverity
  source?: string
  sourceUrl?: string
  startTime?: string | null
  endTime?: string | null
  priority?: number
  programTag?: string
  relatedMissionId?: string
  providerName?: string
  providerType?: string
  missionAvailable?: boolean
  payload?: unknown
}

export type MissionType = 'math' | 'cyber' | 'linux' | 'science' | 'ai'

export type Mission = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: MissionType
  briefing: string
  requiredData: Record<string, unknown>
  timeLimit: number
  steps: MissionStep[]
  grading: 'auto' | 'manual'
  expectedAnswer?: ExpectedAnswer
  learningObjectives?: string[]
  tags?: string[]
}

export type UserPreference = {
  mutedTypes?: string[]
  minSeverity?: AlertSeverity | null
}

export type MissionStep = {
  id: string
  prompt: string
  inputType: 'number' | 'text' | 'choice'
  choices?: string[]
  unitLabel?: string
}

export type ExpectedAnswer = {
  type: 'number' | 'text' | 'choice'
  value: number | string
  tolerance?: number
}

export type MissionAttempt = {
  missionId: string
  actorId: string
  answers: Record<string, unknown>
  submittedAt: string
}

export type MissionResult = {
  pass: boolean
  score?: number
  feedback: string
}

export type SolarActivity = {
  flaresCount?: number
  cmeCount?: number
  strongestClass?: string
  severityPct?: number
}
