import { getItem, setItem, removeItem, getAllKeys } from '../../storage/storage'

export type LocalLearningProgress = {
  moduleId: string
  lessonSlug?: string
  status?: 'not_started' | 'in_progress' | 'submitted' | 'completed'
  currentStepIndex: number
  totalSteps: number
  answers: Record<string, unknown>
  updatedAt: string
}

function keyFor(actorId: string, moduleId: string) {
  return `starkid:${actorId}:learning:progress:${moduleId}`
}

export async function getLocalLearningProgress(actorId: string, moduleId: string) {
  const raw = await getItem(keyFor(actorId, moduleId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as LocalLearningProgress
  } catch {
    return null
  }
}

export async function saveLocalLearningProgress(actorId: string, progress: Omit<LocalLearningProgress, 'updatedAt'>) {
  const payload: LocalLearningProgress = { ...progress, updatedAt: new Date().toISOString() }
  await setItem(keyFor(actorId, progress.moduleId), JSON.stringify(payload))
  return payload
}

export async function clearLocalLearningProgress(actorId: string, moduleId: string) {
  await removeItem(keyFor(actorId, moduleId))
}

export async function listLocalLearningProgress(actorId: string) {
  const keys = await getAllKeys()
  const prefix = `starkid:${actorId}:learning:progress:`
  const mine = keys.filter((k) => k.startsWith(prefix))
  const rows: LocalLearningProgress[] = []
  for (const k of mine) {
    const raw = await getItem(k)
    if (!raw) continue
    try {
      rows.push(JSON.parse(raw))
    } catch {
      // ignore
    }
  }
  return rows
}

