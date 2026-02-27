import { getItem, setItem } from '../storage.ts'

function keyFor(actorId) {
  return `starkid:${actorId}:prefs`
}

export function createLocalPreferencesRepo(actorId) {
  return {
    async get() {
      const raw = await getItem(keyFor(actorId))
      return raw ? JSON.parse(raw) : null
    },
    async set(_actorId, prefs) {
      await setItem(keyFor(actorId), JSON.stringify(prefs))
    },
  }
}
