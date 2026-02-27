import { getCurrentActor } from '../identity.ts'
import { createLocalMissionsRepo } from './localMissionsRepo.ts'
import { createLocalSavedItemsRepo } from './localSavedItemsRepo.ts'
import { createLocalPreferencesRepo } from './localPreferencesRepo.ts'
import { createSupabaseMissionsRepo } from './supabaseMissionsRepo.ts'
import { createSupabaseSavedItemsRepo } from './supabaseSavedItemsRepo.ts'
import { createSupabasePreferencesRepo } from './supabasePreferencesRepo.ts'

export async function getRepos() {
  const actor = await getCurrentActor()
  if (actor.mode === 'user') {
    return {
      missionsRepo: createSupabaseMissionsRepo(),
      savedItemsRepo: createSupabaseSavedItemsRepo(),
      preferencesRepo: createSupabasePreferencesRepo(),
      actor,
    }
  }

  return {
    missionsRepo: createLocalMissionsRepo(actor.actorId),
    savedItemsRepo: createLocalSavedItemsRepo(actor.actorId),
    preferencesRepo: createLocalPreferencesRepo(actor.actorId),
    actor,
  }
}
