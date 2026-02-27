import { NotEnabledRepo } from './types.ts'

export function createSupabaseSavedItemsRepo() {
  return new NotEnabledRepo()
}
