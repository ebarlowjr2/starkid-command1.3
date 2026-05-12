import { describe, expect, test } from 'vitest'
import { configureStorage } from '../../storage.ts'
import { createLocalStemProgressRepo } from '../localStemProgressRepo.ts'

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

describe('stem progress repo', () => {
  test('marks completion and reads it back', async () => {
    const repo = createLocalStemProgressRepo('tester')
    await repo.markCompleted('tester', {
      activityId: 'math.launch.fuel-ratio',
      title: 'Fuel Ratio',
      track: 'math',
      level: 'cadet',
      completedAt: new Date().toISOString(),
    })
    const completed = await repo.listCompleted()
    expect(completed.map((item) => item.activityId)).toContain('math.launch.fuel-ratio')
    const isDone = await repo.isCompleted('tester', 'math.launch.fuel-ratio')
    expect(isDone).toBe(true)
  })
})
