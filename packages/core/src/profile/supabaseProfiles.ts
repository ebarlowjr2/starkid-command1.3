import { getSupabaseClient } from '../clients/supabase/supabase.js'

export type SupabaseProfileRow = {
  id: string
  username: string | null
  xp_total: number
  rank: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export async function getSupabaseProfile(userId: string): Promise<SupabaseProfileRow | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) return null
  return data as SupabaseProfileRow
}

export async function ensureSupabaseProfile(userId: string): Promise<SupabaseProfileRow | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  // In case trigger didn't run (or local dev DB), make sure a row exists.
  await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' })
  return getSupabaseProfile(userId)
}

export async function updateSupabaseProfile(
  userId: string,
  patch: Partial<Pick<SupabaseProfileRow, 'username' | 'xp_total' | 'rank' | 'onboarding_complete'>>
) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data as SupabaseProfileRow
}

