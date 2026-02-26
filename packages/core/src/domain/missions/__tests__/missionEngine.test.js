import { describe, it, expect } from 'vitest'
import { createMissionFromLaunch, createMissionFromEclipse, createMissionFromSolarEvent } from '../missionEngine.js'

const launch = { id: 'l1', name: 'Test Launch', net: '2025-01-02T00:00:00Z' }
const eclipse = { id: 'e1', title: 'Eclipse', start: '2025-01-03T00:00:00Z' }
const solar = { strongestClass: 'M', severityPct: 70 }

describe('mission engine', () => {
  it('createMissionFromLaunch returns valid mission', () => {
    const mission = createMissionFromLaunch(launch)
    expect(['math', 'cyber', 'linux', 'science']).toContain(mission.type)
    expect(mission.difficulty).toBeTruthy()
    expect(mission.briefing).toBeTruthy()
  })

  it('createMissionFromEclipse returns valid mission', () => {
    const mission = createMissionFromEclipse(eclipse)
    expect(['math', 'cyber', 'linux', 'science']).toContain(mission.type)
    expect(mission.difficulty).toBeTruthy()
    expect(mission.briefing).toBeTruthy()
  })

  it('createMissionFromSolarEvent returns valid mission', () => {
    const mission = createMissionFromSolarEvent(solar)
    expect(['math', 'cyber', 'linux', 'science']).toContain(mission.type)
    expect(mission.difficulty).toBeTruthy()
    expect(mission.briefing).toBeTruthy()
  })
})
