import { describe, expect, test } from 'vitest'
import { listStemActivities, generateMissionFromEvent, generateMissionFromAlert, gradeStemAttempt, listTracks, listLevels } from '../service'
import { getLevelConfigFor } from '../service'

describe('stem service', () => {
  test('listStemActivities returns activities', () => {
    const activities = listStemActivities()
    expect(activities.length).toBeGreaterThan(0)
  })

  test('generateMissionFromEvent returns deterministic mission', () => {
    const mission = generateMissionFromEvent({ type: 'launch', name: 'Test Launch', net: '2026-01-01T00:00:00Z' }, 'math', 'cadet')
    expect(mission.id).toContain('stem:launch')
    expect(mission.steps.length).toBeGreaterThan(0)
  })

  test('generateMissionFromAlert returns valid mission', () => {
    const mission = generateMissionFromAlert({ id: 'a', type: 'launch', payload: { name: 'Alpha', net: '2026-01-01T00:00:00Z' } })
    expect(mission.title).toBeTruthy()
  })

  test('gradeStemAttempt supports numeric grading', () => {
    const activities = listStemActivities({ track: 'math', level: 'cadet' })
    const activity = activities[0]
    const result = gradeStemAttempt(activity, { main: activity.expectedAnswer?.value })
    expect(result.pass).toBe(true)
  })

  test('levels list and config', () => {
    const levels = listLevels()
    expect(levels).toContain('cadet')
    const config = getLevelConfigFor('cadet')
    expect(config.maxSteps).toBeGreaterThan(0)
  })

  test('tracks list', () => {
    const tracks = listTracks()
    expect(tracks).toContain('math')
  })
})
