import { NotEnabledRepo } from './types.ts'

export function createSupabasePreferencesRepo() {
  return new NotEnabledRepo()
}
