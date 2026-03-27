import { getSupabaseClient } from '../../clients/supabase/supabase.js'
import { listStemActivities } from '../stem/service'
import type { LearningModule, LearningModuleType } from './types'
import type { StemActivity, StemLevel, StemTrack } from '../stem/types'

type ListModulesFilters = {
  moduleType?: LearningModuleType
  track?: StemTrack
  level?: StemLevel
}

function stemActivityToModule(activity: StemActivity): LearningModule {
  return {
    ...activity,
    moduleType: 'stem',
  }
}

function mapRowToModule(row: any): LearningModule {
  return {
    id: row.id,
    moduleType: row.module_type || 'stem',
    title: row.title,
    description: row.description,
    tagline: row.tagline,
    trainingType: row.training_type,
    track: row.track,
    level: row.level,
    estimatedMinutes: row.estimated_minutes,
    blockCount: row.block_count,
    blockList: row.block_list || [],
    missionContext: row.mission_context,
    objective: row.objective,
    missionOutcomes: row.mission_outcomes || [],
    tags: row.tags || [],
    lessonSlug: row.lesson_slug,
    answerKey: row.answer_key,
    steps: row.steps || [],
    grading: row.grading || 'auto',
    expectedAnswer: row.expected_answer,
    sourceType: 'structured',
  }
}

function mapModuleToRow(module: LearningModule) {
  return {
    id: module.id,
    module_type: module.moduleType,
    title: module.title,
    description: module.description,
    tagline: module.tagline,
    training_type: module.trainingType,
    track: module.track,
    level: module.level,
    estimated_minutes: module.estimatedMinutes,
    block_count: module.blockCount,
    block_list: module.blockList,
    mission_context: module.missionContext,
    objective: module.objective,
    mission_outcomes: module.missionOutcomes,
    tags: module.tags,
    lesson_slug: module.lessonSlug,
    answer_key: module.answerKey,
  }
}

export async function listLearningModules(filters: ListModulesFilters = {}): Promise<LearningModule[]> {
  const baseModules =
    !filters.moduleType || filters.moduleType === 'stem'
      ? listStemActivities({
          track: filters.track,
          level: filters.level,
        }).map(stemActivityToModule)
      : []

  const supabase = getSupabaseClient()
  if (!supabase) return baseModules

  let query = supabase.from('learning_modules').select('*')
  if (filters.moduleType) query = query.eq('module_type', filters.moduleType)
  if (filters.track) query = query.eq('track', filters.track)
  if (filters.level) query = query.eq('level', filters.level)

  const { data, error } = await query
  if (error || !data) return baseModules

  const merged = new Map<string, LearningModule>()
  baseModules.forEach((module) => merged.set(module.id, module))
  data.forEach((row) => {
    const module = mapRowToModule(row)
    merged.set(module.id, module)
  })

  return Array.from(merged.values())
}

export async function getLearningModuleById(id: string): Promise<LearningModule | null> {
  const modules = await listLearningModules()
  return modules.find((module) => module.id === id) || null
}

export async function createLearningModule(module: LearningModule) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const payload = mapModuleToRow(module)
  const { data, error } = await supabase.from('learning_modules').insert(payload).select().single()
  if (error) throw error
  return mapRowToModule(data)
}
