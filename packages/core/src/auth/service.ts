import { getSupabaseClient } from '../clients/supabase/supabase.js'
import { setUserSession } from '../storage/identity.ts'
import type { Session } from './types'
import { getRepos } from '../storage/repos/repoFactory'

function toSession(supabaseSession: any): Session | null {
  if (!supabaseSession?.user?.id) return null
  return { userId: supabaseSession.user.id }
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const session = toSession(data?.session)
  await setUserSession(session)
  return session
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  const session = toSession(data?.session)
  await setUserSession(session)
  return session
}

export async function signUpWithPassword(email: string, password: string, redirectTo?: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  })
  if (error) throw error
  const session = toSession(data?.session)
  await setUserSession(session)
  return session
}

export async function signOut() {
  const supabase = getSupabaseClient()
  if (!supabase) return
  await supabase.auth.signOut()
  await setUserSession(null)
}

export function onAuthChange(cb: (session: Session | null) => void) {
  const supabase = getSupabaseClient()
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const mapped = toSession(session)
    setUserSession(mapped)
    cb(mapped)
  })
  return () => {
    data?.subscription?.unsubscribe()
  }
}

// Future hook: migrate local guest data to user account.
// This currently collects local snapshots for future use.
export async function collectGuestDataSnapshot() {
  const { actor, missionsRepo, savedItemsRepo, stemProgressRepo, profileRepo, preferencesRepo } = await getRepos()
  return {
    actorId: actor.actorId,
    profile: await profileRepo.getProfile(actor.actorId),
    preferences: await preferencesRepo.get(actor.actorId),
    missions: await missionsRepo.listCompleted(actor.actorId),
    missionAttempts: await missionsRepo.listAttempts(actor.actorId),
    stemProgress: await stemProgressRepo.listCompleted(actor.actorId),
    saved: {
      near_earth_object: await savedItemsRepo.list(actor.actorId, 'near_earth_object'),
      comet: await savedItemsRepo.list(actor.actorId, 'comet'),
      sky_event: await savedItemsRepo.list(actor.actorId, 'sky_event'),
      mission: await savedItemsRepo.list(actor.actorId, 'mission'),
      activity: await savedItemsRepo.list(actor.actorId, 'activity'),
    },
  }
}
