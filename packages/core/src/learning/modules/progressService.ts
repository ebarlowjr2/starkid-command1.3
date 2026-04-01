import { getSupabaseClient } from '../../clients/supabase/supabase.js'
import { getSession } from '../../auth/service'
import type { LearningProgress, LearningSubmission } from './types'

function requireUserId() {
  return getSession().then((session) => {
    if (!session?.userId) throw new Error('Authentication required')
    return session.userId
  })
}

function mapProgressRow(row: any): LearningProgress {
  return {
    id: row.id,
    userId: row.user_id,
    moduleId: row.module_id,
    lessonSlug: row.lesson_slug,
    status: row.status || 'not_started',
    currentStepIndex: row.current_step_index || 0,
    totalSteps: row.total_steps || 0,
    answers: row.answers || {},
    startedAt: row.started_at || undefined,
    lastActivityAt: row.last_activity_at || undefined,
    completedAt: row.completed_at || null,
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  }
}

export async function getUserProgressForModule(moduleId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single()
  if (error || !data) return null
  return mapProgressRow(data)
}

export async function startModuleProgress(params: {
  moduleId: string
  lessonSlug?: string
  totalSteps: number
}) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const userId = await requireUserId()
  const { data: existing, error: existingError } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', params.moduleId)
    .single()
  if (existing && !existingError) {
    return mapProgressRow(existing)
  }
  const payload = {
    user_id: userId,
    module_id: params.moduleId,
    lesson_slug: params.lessonSlug || null,
    status: 'in_progress',
    current_step_index: 0,
    total_steps: params.totalSteps,
    answers: {},
    started_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('learning_progress').insert(payload).select().single()
  if (error) throw error
  return mapProgressRow(data)
}

export async function saveModuleProgress(params: {
  moduleId: string
  lessonSlug?: string
  currentStepIndex: number
  totalSteps: number
  answers: Record<string, unknown>
  status?: LearningProgress['status']
}) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const userId = await requireUserId()
  const payload = {
    user_id: userId,
    module_id: params.moduleId,
    lesson_slug: params.lessonSlug || null,
    status: params.status || 'in_progress',
    current_step_index: params.currentStepIndex,
    total_steps: params.totalSteps,
    answers: params.answers,
    last_activity_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('learning_progress')
    .upsert(payload, { onConflict: 'user_id,module_id' })
    .select()
    .single()
  if (error) throw error
  return mapProgressRow(data)
}

export async function completeModuleProgress(moduleId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const userId = await requireUserId()
  const { data: existing } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single()
  const payload = {
    user_id: userId,
    module_id: moduleId,
    status: 'completed',
    current_step_index: existing?.current_step_index ?? 0,
    total_steps: existing?.total_steps ?? 0,
    answers: existing?.answers ?? {},
    completed_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('learning_progress')
    .upsert(payload, { onConflict: 'user_id,module_id' })
    .select()
    .single()
  if (error) throw error
  return mapProgressRow(data)
}

export async function submitModuleForUser(params: {
  moduleId: string
  lessonSlug?: string
  answers: Record<string, unknown>
}) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const userId = await requireUserId()
  const payload = {
    user_id: userId,
    module_id: params.moduleId,
    lesson_slug: params.lessonSlug || null,
    answers: params.answers,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('learning_submissions').insert(payload).select().single()
  if (error) throw error
  const submission: LearningSubmission = {
    id: data.id,
    userId: data.user_id,
    moduleId: data.module_id,
    lessonSlug: data.lesson_slug,
    answers: data.answers || {},
    status: 'submitted',
    submittedAt: data.submitted_at,
  }
  return submission
}

export async function listCompletedModulesForUser() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
  if (error || !data) return []
  return data.map(mapProgressRow)
}
