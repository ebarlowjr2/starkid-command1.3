import { NotEnabledRepo } from './types.ts'

export function createSupabaseMissionsRepo() {
  return new NotEnabledRepo()
}
