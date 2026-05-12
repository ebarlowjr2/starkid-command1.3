import type { ExpectedAnswer, MissionStep } from '@starkid/types'

export type StemTrack = 'math' | 'cyber' | 'linux' | 'ai' | 'science'
export type StemLevel = 'cadet' | 'explorer' | 'specialist' | 'operator'

export type StemTemplate = {
  id: string
  track: StemTrack
  level: StemLevel
  eventTypes: Array<'launch' | 'eclipse' | 'solar' | 'comet' | 'generic'>
  titleTemplate: string
  briefingTemplate: string
  stepBuilder: (context: StemTemplateContext) => MissionStep[]
  gradingMode: 'auto' | 'manual'
  expectedAnswerBuilder?: (context: StemTemplateContext) => ExpectedAnswer | undefined
  tags?: string[]
  learningObjectives?: string[]
}

export type StemActivity = {
  id: string
  title: string
  description: string
  tagline?: string
  trainingType?: string
  lessonSlug?: string
  track: StemTrack
  level: StemLevel
  estimatedMinutes?: number
  blockCount?: number
  blockList?: string[]
  missionContext?: string
  objective?: string
  missionOutcomes?: string[]
  tags?: string[]
  learningObjectives?: string[]
  steps: MissionStep[]
  grading: 'auto' | 'manual'
  expectedAnswer?: ExpectedAnswer
  sourceType?: 'structured' | 'dynamic'
}

export type StemMission = {
  id: string
  title: string
  briefing: string
  track: StemTrack
  level: StemLevel
  linkedActivityId?: string | null
  type?: StemTrack
  difficulty?: 'easy' | 'medium' | 'hard'
  eventSource: 'launch' | 'sky-event' | 'solar' | 'comet' | 'generic'
  steps: MissionStep[]
  grading: 'auto' | 'manual'
  expectedAnswer?: ExpectedAnswer
  learningObjectives?: string[]
  tags?: string[]
  aiAugmented?: boolean
  requiredData?: Record<string, unknown>
  timeLimit?: number
}

export type StemTemplateContext = {
  event?: Record<string, unknown>
  level: StemLevel
  track: StemTrack
}
