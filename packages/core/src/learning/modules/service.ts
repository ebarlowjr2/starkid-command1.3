import { getSupabaseClient } from '../../clients/supabase/supabase.js'
import { listStemActivities } from '../stem/service'
import type { LearningModule, LearningModuleType } from './types'
import type { StemActivity, StemLevel, StemTrack } from '../stem/types'

type ListModulesFilters = {
  moduleType?: LearningModuleType
  track?: StemTrack
  level?: StemLevel
  audience?: 'learner' | 'admin'
  status?: LearningModule['status']
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
    status: row.status || undefined,
    submittedForReviewAt: row.submitted_for_review_at || undefined,
    publishedAt: row.published_at || undefined,
    archivedAt: row.archived_at || undefined,
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
    status: module.status,
    submitted_for_review_at: module.submittedForReviewAt,
    published_at: module.publishedAt,
    archived_at: module.archivedAt,
  }
}

export async function listLearningModules(filters: ListModulesFilters = {}): Promise<LearningModule[]> {
  const audience = filters.audience || 'learner'
  const baseModules =
    !filters.moduleType || filters.moduleType === 'stem'
      ? listStemActivities({
          track: filters.track,
          level: filters.level,
        }).map((activity) => ({
          ...stemActivityToModule(activity),
          status: 'published',
        }))
      : []

  const supabase = getSupabaseClient()
  if (!supabase) return baseModules

  let query = supabase.from('learning_modules').select('*')
  if (filters.moduleType) query = query.eq('module_type', filters.moduleType)
  if (filters.track) query = query.eq('track', filters.track)
  if (filters.level) query = query.eq('level', filters.level)
  if (filters.status) {
    query = query.eq('status', filters.status)
  } else if (audience === 'learner') {
    query = query.eq('status', 'published')
  }

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

export async function getLearningModuleByLessonSlug(slug: string) {
  const modules = await listLearningModules({ audience: 'learner' })
  return modules.find((module) => module.lessonSlug === slug) || null
}

export async function createLearningModule(module: LearningModule) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const payload = mapModuleToRow({
    ...module,
    status: module.status || 'draft',
  })
  const { data, error } = await supabase.from('learning_modules').insert(payload).select().single()
  if (error) throw error
  return mapRowToModule(data)
}

async function updateModuleStatus(id: string, status: LearningModule['status']) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const updates: Record<string, any> = { status }
  if (status === 'in_review') updates.submitted_for_review_at = new Date().toISOString()
  if (status === 'published') updates.published_at = new Date().toISOString()
  if (status === 'archived') updates.archived_at = new Date().toISOString()
  if (status === 'draft') updates.archived_at = null

  const { data, error } = await supabase
    .from('learning_modules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRowToModule(data)
}

export function submitModuleForReview(id: string) {
  return updateModuleStatus(id, 'in_review')
}

export function publishModule(id: string) {
  return updateModuleStatus(id, 'published')
}

export function sendModuleBackToDraft(id: string) {
  return updateModuleStatus(id, 'draft')
}

export function archiveModule(id: string) {
  return updateModuleStatus(id, 'archived')
}
