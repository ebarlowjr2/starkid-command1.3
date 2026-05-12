import { RepoNotEnabledError } from './types'

export function createSupabaseProfileRepo() {
  return {
    async getProfile() {
      throw new RepoNotEnabledError('Supabase profile repo not enabled yet')
    },
    async saveProfile() {
      throw new RepoNotEnabledError('Supabase profile repo not enabled yet')
    },
    async updateProfile() {
      throw new RepoNotEnabledError('Supabase profile repo not enabled yet')
    },
  }
}
