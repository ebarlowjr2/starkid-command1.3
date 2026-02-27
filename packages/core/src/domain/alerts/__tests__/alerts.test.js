import { describe, it, expect } from 'vitest'
import { generateAlerts, filterByUserPreference, convertAlertToMission } from '../alerts.js'

const now = new Date('2025-01-01T00:00:00Z')
const day = 24 * 60 * 60 * 1000

const launchA = { id: 'a', name: 'Launch A', net: new Date(now.getTime() + day).toISOString() }
const launchB = { id: 'b', name: 'Launch B', net: new Date(now.getTime() + day).toISOString() }
const eclipse = { id: 'e1', title: 'Solar Eclipse', type: 'eclipse', start: new Date(now.getTime() + day).toISOString() }
const meteor = { id: 'm1', title: 'Meteor Shower', type: 'meteor-shower', start: new Date(now.getTime() + day).toISOString() }

const solar = { strongestClass: 'M', severityPct: 70 }

describe('alerts', () => {
  it('generateAlerts returns sorted alerts array', async () => {
    const alerts = await generateAlerts({
      launches: [launchB, launchA],
      skyEvents: [meteor, eclipse],
      solarActivity: solar,
    })

    expect(Array.isArray(alerts)).toBe(true)
    expect(alerts.length).toBeGreaterThan(0)

    // Same date: high severity (eclipse) should come before info (meteor)
    const eclipseIdx = alerts.findIndex((a) => a.id.startsWith('event:e1'))
    const meteorIdx = alerts.findIndex((a) => a.id.startsWith('event:m1'))
    expect(eclipseIdx).toBeLessThan(meteorIdx)

    // Same date + severity: stable by id
    const launchAIdx = alerts.findIndex((a) => a.id === 'launch:a')
    const launchBIdx = alerts.findIndex((a) => a.id === 'launch:b')
    expect(launchAIdx).toBeLessThan(launchBIdx)

    // Solar has no date; should sort last
    const solarIdx = alerts.findIndex((a) => a.id.startsWith('solar:'))
    expect(solarIdx).toBe(alerts.length - 1)
  })

  it('filterByUserPreference filters by type and severity', () => {
    const sample = [
      { id: '1', type: 'launch', severity: 'medium' },
      { id: '2', type: 'sky-event', severity: 'info' },
      { id: '3', type: 'solar', severity: 'high' },
    ]

    const filtered = filterByUserPreference(sample, { mutedTypes: ['sky-event'], minSeverity: 'medium' })
    expect(filtered.map((a) => a.id)).toEqual(['1', '3'])
  })

  it('convertAlertToMission returns a mission with required fields', () => {
    const alert = { id: 'launch:a', type: 'launch', payload: launchA }
    const mission = convertAlertToMission(alert)
    expect(mission).toBeTruthy()
    expect(mission.title).toBeTruthy()
    expect(mission.type).toBeTruthy()
    expect(mission.briefing).toBeTruthy()
    expect(mission.requiredData).toBeTruthy()
  })
})
