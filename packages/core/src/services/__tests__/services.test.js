import { describe, expect, test } from 'vitest'
import { formatSourceStatus } from '../../services/diagnostics.ts'
import { getUpcomingLaunches } from '../../services/launchesService.ts'
import { getUpcomingSkyEventsService } from '../../services/skyEventsService.ts'
import { getAlertsForUser } from '../../services/alertsService.ts'

describe('services layer', () => {
  test('formatSourceStatus renders ok and failed entries', () => {
    const message = formatSourceStatus([
      { name: 'launch-library', ok: true, count: 2 },
      { name: 'spacex', ok: false, error: 'network' },
    ])
    expect(message).toContain('launch-library: ok (2)')
    expect(message).toContain('spacex: failed (network)')
  })

  test('launchesService merges + sorts launches', async () => {
    const { data } = await getUpcomingLaunches({
      sourcesOverride: {
        launchLibrary: [
          { id: 'll1', name: 'Alpha', net: '2026-01-05T00:00:00Z' },
          { id: 'll2', name: 'Beta', net: '2026-01-01T00:00:00Z' },
        ],
        spaceX: [
          { id: 'spx1', name: 'Gamma', date_utc: '2026-01-03T00:00:00Z' },
        ],
      },
    })
    expect(data.map((item) => item.name)).toEqual(['Beta', 'Gamma', 'Alpha'])
  })

  test('skyEventsService dedupes by title/date', async () => {
    const { data } = await getUpcomingSkyEventsService({
      sourcesOverride: {
        dbEvents: [{ id: '1', title: 'Lunar Eclipse', start: '2026-03-01T00:00:00Z' }],
        staticEvents: [{ title: 'Lunar Eclipse', start: '2026-03-01T00:00:00Z' }],
      },
    })
    expect(data.length).toBe(1)
  })

  test('alertsService uses service inputs', async () => {
    const alertsResult = await getAlertsForUser(undefined, {
      launches: {
        data: [{ id: 'launch:1', type: 'launch', title: 'Test Launch', severity: 'medium', startTime: '2026-01-01T00:00:00Z' }],
        sources: [{ name: 'launch-library', ok: true, count: 1 }],
      },
      skyEvents: {
        data: [{ id: '2', title: 'Test Event', start: '2026-01-02T00:00:00Z', type: 'eclipse' }],
        sources: [{ name: 'sky-events-static', ok: true, count: 1 }],
      },
      asteroids: {
        data: [{ id: 'neo-1', name: 'NEO-1', close_approach_data: [{ close_approach_date: '2026-01-03' }] }],
        sources: [{ name: 'neo-feed', ok: true, count: 1 }],
      },
      solar: {
        data: { strongestClass: 'M1', severityPct: 70 },
        sources: [{ name: 'donki', ok: true, count: 1 }],
      },
      artemis: {
        data: [],
        sources: [{ name: 'nasa-artemis', ok: true, count: 0 }],
      },
    })
    expect(alertsResult.data.length).toBeGreaterThan(0)
    expect(alertsResult.data.some((alert) => alert.category === 'lunar_event')).toBe(true)
    expect(alertsResult.data.some((alert) => alert.category === 'asteroid_flyby')).toBe(true)
    expect(alertsResult.sources.some((source) => source.name === 'alerts-engine')).toBe(true)
  })
})
