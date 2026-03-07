import { getItem, setItem } from '../storage.ts'

function keyFor(actorId: string) {
  return `starkid:${actorId}:stem:completed`
}

async function readJson(key: string, fallback: string[]) {
  const raw = await getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

async function writeJson(key: string, value: string[]) {
  await setItem(key, JSON.stringify(value))
}

export function createLocalStemProgressRepo(actorId: string) {
  return {
    async markCompleted(_actorId: string, activityId: string) {
      const key = keyFor(actorId)
      const completed = await readJson(key, [])
      if (!completed.includes(activityId)) {
        completed.push(activityId)
        await writeJson(key, completed)
      }
    },
    async isCompleted(_actorId: string, activityId: string) {
      const completed = await readJson(keyFor(actorId), [])
      return completed.includes(activityId)
    },
    async listCompleted() {
      return readJson(keyFor(actorId), [])
    },
  }
}
