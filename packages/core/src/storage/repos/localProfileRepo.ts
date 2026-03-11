import { getItem, setItem } from '../storage.ts'

function keyFor(actorId: string) {
  return `starkid:${actorId}:profile`
}

export function createLocalProfileRepo(actorId: string) {
  return {
    async getProfile() {
      const raw = await getItem(keyFor(actorId))
      return raw ? JSON.parse(raw) : null
    },
    async saveProfile(_actorId: string, profile: any) {
      await setItem(keyFor(actorId), JSON.stringify(profile))
    },
    async updateProfile(_actorId: string, patch: any) {
      const raw = await getItem(keyFor(actorId))
      const current = raw ? JSON.parse(raw) : {}
      const next = { ...current, ...patch }
      await setItem(keyFor(actorId), JSON.stringify(next))
      return next
    },
  }
}
