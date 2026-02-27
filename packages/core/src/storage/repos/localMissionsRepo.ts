import { getItem, setItem } from '../storage.ts'

function keyFor(actorId, suffix) {
  return `starkid:${actorId}:missions:${suffix}`
}

async function readJson(key, fallback) {
  const raw = await getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

async function writeJson(key, value) {
  await setItem(key, JSON.stringify(value))
}

export function createLocalMissionsRepo(actorId) {
  return {
    async listAttempts() {
      return readJson(keyFor(actorId, 'attempts'), [])
    },
    async saveAttempt(_actorId, attempt) {
      const key = keyFor(actorId, 'attempts')
      const attempts = await readJson(key, [])
      attempts.push(attempt)
      await writeJson(key, attempts)
    },
    async markCompleted(_actorId, missionId) {
      const key = keyFor(actorId, 'completed')
      const completed = await readJson(key, [])
      if (!completed.includes(missionId)) {
        completed.push(missionId)
        await writeJson(key, completed)
      }
    },
    async listCompleted() {
      return readJson(keyFor(actorId, 'completed'), [])
    },
  }
}
