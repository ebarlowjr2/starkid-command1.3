import { describe, it, expect } from 'vitest'
import { configureStorage } from '../../storage/storage.ts'
import { generateAlerts, convertAlertToMission } from '../alerts/alerts.js'
import { gradeAttempt } from '../missions/grading.ts'
import { getRepos } from '../../storage/repos/repoFactory.ts'

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

describe('integration', () => {
  it('generates alert, converts to mission, grades attempt, saves completion', async () => {
    const alerts = await generateAlerts({
      launches: [{ id: 'l1', name: 'Test Launch', net: '2025-01-02T00:00:00Z' }],
      skyEvents: [],
      solarActivity: null,
    })
    expect(alerts.length).toBeGreaterThan(0)

    const mission = convertAlertToMission(alerts[0])
    expect(mission).toBeTruthy()

    const { pass } = gradeAttempt(mission, { main: 'acknowledged' })
    expect(pass).toBe(true)

    const { missionsRepo, actor } = await getRepos()
    await missionsRepo.saveAttempt(actor.actorId, {
      missionId: mission.id,
      actorId: actor.actorId,
      answers: { main: 'acknowledged' },
      submittedAt: new Date().toISOString(),
      result: 'pass',
    })
    await missionsRepo.markCompleted(actor.actorId, mission.id)

    const completed = await missionsRepo.listCompleted(actor.actorId)
    expect(completed).toContain(mission.id)
  })
})
