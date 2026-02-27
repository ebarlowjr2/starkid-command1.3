import { getItem, setItem } from '../storage.ts'

function keyFor(actorId, type) {
  return `starkid:${actorId}:saved:${type}`
}

async function readJson(key, fallback) {
  const raw = await getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

async function writeJson(key, value) {
  await setItem(key, JSON.stringify(value))
}

export function createLocalSavedItemsRepo(actorId) {
  return {
    async save(_actorId, item) {
      const type = item.type || 'default'
      const key = keyFor(actorId, type)
      const items = await readJson(key, [])
      const exists = items.some((entry) => entry.id === item.id)
      if (!exists) {
        items.push(item)
        await writeJson(key, items)
      }
    },
    async remove(_actorId, itemId, type = 'default') {
      const key = keyFor(actorId, type)
      const items = await readJson(key, [])
      const next = items.filter((entry) => entry.id !== itemId)
      await writeJson(key, next)
    },
    async list(_actorId, type = 'default') {
      return readJson(keyFor(actorId, type), [])
    },
  }
}
