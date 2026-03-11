import { describe, it, expect, beforeEach } from 'vitest'
import { configureStorage } from '../../storage.ts'
import { getDefaultProfile } from '../defaults'
import { getProfile, updateProfile, recalculateRank, getSavedObjectsSummary } from '../service'
import { getRepos } from '../../storage/repos/repoFactory'

const memory = new Map()

configureStorage({
  async getItem(key) {
    return memory.has(key) ? memory.get(key) : null
  },
  async setItem(key, value) {
    memory.set(key, value)
  },
  async removeItem(key) {
    memory.delete(key)
  },
  async getAllKeys() {
    return Array.from(memory.keys())
  },
})

describe('profile service', () => {
  beforeEach(() => {
    memory.clear()
  })

  it('getDefaultProfile returns a valid profile', () => {
    const profile = getDefaultProfile('actor-1')
    expect(profile.actorId).toBe('actor-1')
    expect(profile.rank).toBe('Cadet')
    expect(profile.alertPreferences.missionAlerts).toBe(true)
  })

  it('updateProfile persists changes', async () => {
    const profile = await getProfile()
    const next = await updateProfile({ displayName: 'Cadet-9999' })
    expect(next.displayName).toBe('Cadet-9999')
    const profile2 = await getProfile()
    expect(profile2.displayName).toBe('Cadet-9999')
  })

  it('recalculateRank uses missions and activities thresholds', async () => {
    const { missionsRepo, stemProgressRepo, actor } = await getRepos()
    await missionsRepo.markCompleted(actor.actorId, 'mission-1')
    await missionsRepo.markCompleted(actor.actorId, 'mission-2')
    let rank = await recalculateRank()
    expect(rank).toBe('Explorer')

    await stemProgressRepo.markCompleted(actor.actorId, { activityId: 'math.launch.fuel-ratio', completedAt: new Date().toISOString() })
    await stemProgressRepo.markCompleted(actor.actorId, { activityId: 'science.eclipse.visibility', completedAt: new Date().toISOString() })
    await stemProgressRepo.markCompleted(actor.actorId, { activityId: 'cyber.groundstation.auth-failure', completedAt: new Date().toISOString() })
    rank = await recalculateRank()
    expect(['Specialist', 'Operator']).toContain(rank)
  })

  it('getSavedObjectsSummary aggregates counts', async () => {
    const { savedItemsRepo, actor } = await getRepos()
    await savedItemsRepo.save(actor.actorId, { id: 'neo-1', type: 'near_earth_object' })
    await savedItemsRepo.save(actor.actorId, { id: 'comet-1', type: 'comet' })
    const summary = await getSavedObjectsSummary()
    expect(summary.nearEarthObjects).toBe(1)
    expect(summary.comets).toBe(1)
  })
})
