import { describe, expect, test, beforeEach } from 'vitest'
import { configureStorage } from '../../../storage/storage.ts'
import { listStemActivities } from '../../stem/service'
import { getStemProgressOverview, markStemActivityCompleted, syncMissionCompletionToActivity } from '../service'
import { calculateTrackProgress, getRecommendedNextActivity } from '../calculators'

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

process.env.STARKID_TEST_ACTOR_ID = 'progress-test'

describe('stem progress', () => {
  beforeEach(() => {
    memory.clear()
  })
  test('calculates track progress and recommends next activity', () => {
    const activities = listStemActivities()
    const completions = []
    const trackProgress = calculateTrackProgress('math', activities, completions)
    expect(trackProgress.total).toBeGreaterThan(0)
    expect(trackProgress.percent).toBe(0)
    expect(trackProgress.currentLevel).toBeTruthy()

    const recommended = getRecommendedNextActivity(activities, completions)
    expect(recommended).toBeTruthy()
  })

  test('overview includes tracks and recent completions', async () => {
    const activities = listStemActivities()
    await markStemActivityCompleted(activities[0].id, activities[0])
    const overview = await getStemProgressOverview()
    expect(overview.tracks.length).toBeGreaterThan(0)
    expect(overview.recentCompletions.length).toBeGreaterThan(0)
  })

  test('progress percent increases with completions', async () => {
    const activities = listStemActivities({ track: 'math' })
    const first = activities[0]
    await markStemActivityCompleted(first.id, first)
    const overview = await getStemProgressOverview()
    const math = overview.tracks.find((item) => item.track === 'math')
    expect(math.percent).toBeGreaterThan(0)
  })

  test('sync mission completion marks linked activity', async () => {
    const activities = listStemActivities()
    const linked = activities[0]
    const mission = {
      id: 'stem:launch:test',
      title: 'Test Mission',
      briefing: 'Test',
      track: linked.track,
      level: linked.level,
      eventSource: 'launch',
      steps: linked.steps,
      grading: linked.grading,
      linkedActivityId: linked.id,
    }

    const result = await syncMissionCompletionToActivity(mission)
    expect(result.created).toBe(true)
  })
})
