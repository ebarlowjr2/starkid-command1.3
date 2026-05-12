import { describe, it, expect } from 'vitest'
import { configureStorage } from '../../storage.ts'
import { createLocalMissionsRepo } from '../localMissionsRepo.ts'

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

describe('localMissionsRepo', () => {
  it('markCompleted persists and isCompleted returns true', async () => {
    const repo = createLocalMissionsRepo('actor-1')
    await repo.markCompleted('actor-1', 'mission-123')
    const completed = await repo.isCompleted('actor-1', 'mission-123')
    expect(completed).toBe(true)
  })
})
