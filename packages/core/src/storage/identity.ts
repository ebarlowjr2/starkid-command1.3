import { getItem, setItem } from './storage.ts'
import { generateUuid } from '../utils/uuid.ts'

let session = null

export async function setUserSession(nextSession) {
  session = nextSession
}

export async function getOrCreateAnonymousId() {
  const existing = await getItem('starkid:anonymousId')
  if (existing) return existing
  const created = generateUuid()
  await setItem('starkid:anonymousId', created)
  return created
}

export async function getCurrentActor() {
  const testActorId = typeof process !== 'undefined' ? process.env.STARKID_TEST_ACTOR_ID : undefined
  if (testActorId) {
    return { actorId: testActorId, mode: 'anonymous' }
  }

  if (session?.userId) {
    return { actorId: session.userId, mode: 'user', userId: session.userId }
  }

  const anonymousId = await getOrCreateAnonymousId()
  return { actorId: anonymousId, mode: 'anonymous' }
}
