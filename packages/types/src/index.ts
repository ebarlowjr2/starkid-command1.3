export type Launch = {
  id?: string | number
  name?: string
  net?: string
  window_start?: string
  pad?: {
    name?: string
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
  savedAt?: string
  notify?: boolean
}

export type AlertSeverity = 'info' | 'medium' | 'high'

export type Alert = {
  id: string
  type: 'launch' | 'sky-event' | 'solar' | string
  title: string
  severity: AlertSeverity
  source?: string
  startTime?: string | null
  priority?: number
  missionAvailable?: boolean
  payload?: unknown
}

export type MissionType = 'math' | 'cyber' | 'linux' | 'science'

export type Mission = {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: MissionType
  briefing: string
  requiredData: Record<string, unknown>
  timeLimit: number
  steps?: MissionStep[]
  grading?: 'auto' | 'manual'
  expectedAnswer?: {
    type: 'number' | 'text' | 'choice'
    value: unknown
    tolerance?: number
  }
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
}

export type MissionAttempt = {
  missionId: string
  actorId: string
  answers: Record<string, unknown>
  submittedAt: string
  result: 'pass' | 'fail'
  feedback?: string
}
