import { getCurrentActor } from '../identity.ts'
import { createLocalMissionsRepo } from './localMissionsRepo.ts'
import { createLocalSavedItemsRepo } from './localSavedItemsRepo.ts'
import { createLocalPreferencesRepo } from './localPreferencesRepo.ts'
import { createLocalProfileRepo } from './localProfileRepo.ts'
import { createSupabaseMissionsRepo } from './supabaseMissionsRepo.ts'
import { createSupabaseSavedItemsRepo } from './supabaseSavedItemsRepo.ts'
import { createSupabasePreferencesRepo } from './supabasePreferencesRepo.ts'
import { createSupabaseProfileRepo } from './supabaseProfileRepo.ts'
import { createLocalStemProgressRepo } from './localStemProgressRepo.ts'
import { createSupabaseStemProgressRepo } from './supabaseStemProgressRepo.ts'

export async function getRepos() {
  const actor = await getCurrentActor()
  if (actor.mode === 'user') {
    return {
      missionsRepo: createSupabaseMissionsRepo(),
      savedItemsRepo: createSupabaseSavedItemsRepo(),
      preferencesRepo: createSupabasePreferencesRepo(),
      profileRepo: createSupabaseProfileRepo(),
      stemProgressRepo: createSupabaseStemProgressRepo(),
      actor,
    }
  }

  return {
    missionsRepo: createLocalMissionsRepo(actor.actorId),
    savedItemsRepo: createLocalSavedItemsRepo(actor.actorId),
    preferencesRepo: createLocalPreferencesRepo(actor.actorId),
    profileRepo: createLocalProfileRepo(actor.actorId),
    stemProgressRepo: createLocalStemProgressRepo(actor.actorId),
    actor,
  }
}
