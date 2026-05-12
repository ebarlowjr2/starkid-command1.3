import { getSupabaseClient } from '../clients/supabase/supabase.js'
import { setUserSession, getOrCreateAnonymousId } from '../storage/identity.ts'
import type { Session } from './types'
import { getRepos } from '../storage/repos/repoFactory'
import { createLocalMissionsRepo } from '../storage/repos/localMissionsRepo.ts'
import { createLocalSavedItemsRepo } from '../storage/repos/localSavedItemsRepo.ts'
import { createLocalStemProgressRepo } from '../storage/repos/localStemProgressRepo.ts'
import { createLocalProfileRepo } from '../storage/repos/localProfileRepo.ts'
import { createLocalPreferencesRepo } from '../storage/repos/localPreferencesRepo.ts'
import { removeItem } from '../storage/storage.ts'
import { listLocalLearningProgress, clearLocalLearningProgress } from '../learning/modules/localProgress'
import { saveModuleProgress } from '../learning/modules/progressService'
import { ensureSupabaseProfile } from '../profile/supabaseProfiles'

const SAVED_TYPES = ['near_earth_object', 'comet', 'sky_event', 'mission', 'activity']

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
  const guestId = await getOrCreateAnonymousId()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  const session = toSession(data?.session)
  if (session?.userId) {
    await migrateLocalGuestData(guestId, session.userId)
    await ensureSupabaseProfile(session.userId)
  }
  await setUserSession(session)
  return session
}

export async function signUpWithPassword(email: string, password: string, redirectTo?: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase not configured')
  const guestId = await getOrCreateAnonymousId()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  })
  if (error) throw error
  const session = toSession(data?.session)
  if (session?.userId) {
    await migrateLocalGuestData(guestId, session.userId)
    await ensureSupabaseProfile(session.userId)
  }
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

export async function migrateLocalGuestData(guestId: string, userId: string) {
  if (!guestId || !userId || guestId === userId) return
  const guestMissions = createLocalMissionsRepo(guestId)
  const userMissions = createLocalMissionsRepo(userId)
  const guestSaved = createLocalSavedItemsRepo(guestId)
  const userSaved = createLocalSavedItemsRepo(userId)
  const guestStem = createLocalStemProgressRepo(guestId)
  const userStem = createLocalStemProgressRepo(userId)
  const guestProfile = createLocalProfileRepo(guestId)
  const userProfile = createLocalProfileRepo(userId)
  const guestPrefs = createLocalPreferencesRepo(guestId)
  const userPrefs = createLocalPreferencesRepo(userId)

  const profile = await guestProfile.getProfile()
  if (profile) await userProfile.saveProfile(userId, { ...profile, actorId: userId })

  const prefs = await guestPrefs.get()
  if (prefs) await userPrefs.set(userId, prefs)

  const completedMissions = await guestMissions.listCompleted()
  for (const missionId of completedMissions) {
    await userMissions.markCompleted(userId, missionId)
  }
  const attempts = await guestMissions.listAttempts()
  for (const attempt of attempts) {
    await userMissions.saveAttempt(userId, { ...attempt, actorId: userId })
  }

  const completions = await guestStem.listCompleted()
  for (const completion of completions) {
    await userStem.markCompleted(userId, completion)
  }

  for (const type of SAVED_TYPES) {
    const items = await guestSaved.list(guestId, type)
    for (const item of items) {
      await userSaved.save(userId, item)
    }
  }

  // Learning module progress migration (guest -> user).
  // This keeps progress/answers when a user establishes identity.
  try {
    const learningRows = await listLocalLearningProgress(guestId)
    for (const row of learningRows) {
      await saveModuleProgress({
        moduleId: row.moduleId,
        lessonSlug: row.lessonSlug,
        currentStepIndex: row.currentStepIndex,
        totalSteps: row.totalSteps,
        answers: row.answers || {},
        status: row.status || 'in_progress',
      })
      await clearLocalLearningProgress(guestId, row.moduleId)
    }
  } catch {
    // ignore migration failures
  }

  await clearGuestData(guestId)
}

async function clearGuestData(guestId: string) {
  const keys = [
    `starkid:${guestId}:profile`,
    `starkid:${guestId}:prefs`,
    `starkid:${guestId}:missions:attempts`,
    `starkid:${guestId}:missions:completed`,
    `starkid:${guestId}:stem:completed`,
    ...SAVED_TYPES.map((type) => `starkid:${guestId}:saved:${type}`),
  ]
  await Promise.all(keys.map((key) => removeItem(key)))

  // best-effort: clear learning progress keys
  try {
    const rows = await listLocalLearningProgress(guestId)
    await Promise.all(rows.map((r) => clearLocalLearningProgress(guestId, r.moduleId)))
  } catch {
    // ignore
  }
}
