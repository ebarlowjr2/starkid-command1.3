import { describe, it, expect } from 'vitest'
import { configureStorage } from '../../storage/storage.ts'
import { convertAlertToMission } from '../alerts/alerts.js'
import { getAlertsForUser } from '../../services/alertsService.ts'
import { gradeAttempt } from '../missions/grading.ts'
import { getRepos } from '../../storage/repos/repoFactory.ts'

const memory = new Map()

process.env.STARKID_TEST_ACTOR_ID = 'test-actor'

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
    const result = await getAlertsForUser(undefined, {
      launches: { data: [{ id: 'launch:l1', type: 'launch', title: 'Test Launch', severity: 'medium', startTime: '2025-01-02T00:00:00Z' }], sources: [] },
      skyEvents: { data: [], sources: [] },
      solar: { data: null, sources: [] },
      artemis: { data: [], sources: [] },
    })
    expect(result.data.length).toBeGreaterThan(0)

    const mission = convertAlertToMission(result.data[0])
    expect(mission).toBeTruthy()

    const expected = mission?.expectedAnswer
    const answerValue = expected?.value ?? 2
    const { pass } = gradeAttempt(mission, { main: answerValue })
    expect(pass).toBe(true)

    const { missionsRepo, actor } = await getRepos()
    await missionsRepo.saveAttempt(actor.actorId, {
      missionId: mission.id,
      actorId: actor.actorId,
      answers: { main: answerValue },
      submittedAt: new Date().toISOString(),
      result: 'pass',
    })
    await missionsRepo.markCompleted(actor.actorId, mission.id)

    const completed = await missionsRepo.listCompleted(actor.actorId)
    expect(completed).toContain(mission.id)
  })
})
