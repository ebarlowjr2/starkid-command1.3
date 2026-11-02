import { describe, expect, it } from 'vitest'
import { normalizeAlertSnapshot, planLaunchAlerts, launchAlertStillValid, launchIdFromNotification, validateLaunchAlertPreferences } from '../launchAlertRules'
const id = '11111111-1111-4111-8111-111111111111'
const now = Date.parse('2026-11-02T12:00:00Z')
const raw = (minutes = 10, status = 1, precision = 0) => ({ id, name: 'Test launch', status: { id: status }, net_precision: { id: precision }, net: new Date(now + minutes * 60000).toISOString() })
const prefs = { enabled: true, reminder_minutes: [60, 10], schedule_changes: true }
describe('launch notification eligibility', () => {
  it('plans only a fresh reminder within its delivery window', () => {
    expect(planLaunchAlerts(normalizeAlertSnapshot(raw(), now), null, now)).toHaveLength(1)
    expect(planLaunchAlerts(normalizeAlertSnapshot(raw(), now - 91000), null, now)).toEqual([])
    expect(planLaunchAlerts(normalizeAlertSnapshot(raw(4), now), null, now)).toEqual([])
    expect(planLaunchAlerts(normalizeAlertSnapshot(raw(-1), now), null, now)).toEqual([])
  })
  it('does not announce uncertain launch times or held launches', () => {
    for (const status of [2, 3, 4, 5, 6, 7, 8]) expect(planLaunchAlerts(normalizeAlertSnapshot(raw(10, status), now), null, now)).toEqual([])
    for (const precision of [2, 3, 5, 7]) expect(planLaunchAlerts(normalizeAlertSnapshot(raw(10, 1, precision), now), null, now)).toEqual([])
  })
  it('uses a stable reminder key across repeated polls', () => {
    const first = normalizeAlertSnapshot(raw(), now)
    const next = normalizeAlertSnapshot(raw(), now + 60000, first)
    expect(planLaunchAlerts(first, null, now)[0].key).toBe(planLaunchAlerts(next, first, now + 60000)[0].key)
  })
  it('generates revisions for reschedules and status changes without first-observation noise', () => {
    const previous = normalizeAlertSnapshot(raw(180), now - 60000)
    const current = normalizeAlertSnapshot(raw(210), now, previous)
    expect(planLaunchAlerts(current, previous, now)[0].kind).toBe('schedule')
    expect(planLaunchAlerts(current, null, now)).toEqual([])
    const held = normalizeAlertSnapshot(raw(210, 5), now, current)
    expect(planLaunchAlerts(held, current, now)[0].kind).toBe('status')
    expect(held.revision).toBe(3)
  })
  it('rechecks opt-out, expiration, reschedules and subscription timing before sending', () => {
    const latest = normalizeAlertSnapshot(raw(), now)
    const event = planLaunchAlerts(latest, null, now)[0]
    const subscribed = new Date(now - 1000).toISOString()
    expect(launchAlertStillValid(event, latest, prefs, subscribed, now)).toBe(true)
    expect(launchAlertStillValid(event, latest, { ...prefs, enabled: false }, subscribed, now)).toBe(false)
    expect(launchAlertStillValid(event, latest, { ...prefs, reminder_minutes: [] }, subscribed, now)).toBe(false)
    expect(launchAlertStillValid(event, { ...latest, net: raw(20).net }, prefs, subscribed, now)).toBe(false)
    expect(launchAlertStillValid(event, latest, prefs, new Date(now + 1000).toISOString(), now)).toBe(false)
    expect(launchAlertStillValid(event, latest, prefs, subscribed, now + 300000)).toBe(false)
  })
  it('rejects arbitrary notification URLs and unsupported reminder preferences', () => {
    expect(launchIdFromNotification({ type: 'launch-alert', launchId: id })).toBe(id)
    expect(launchIdFromNotification({ type: 'launch-alert', launchId: 'https://evil.test' })).toBeNull()
    expect(launchIdFromNotification({ type: 'other', launchId: id })).toBeNull()
    expect(() => validateLaunchAlertPreferences({ ...prefs, reminder_minutes: [10, 10] })).toThrow()
    expect(() => validateLaunchAlertPreferences({ ...prefs, reminder_minutes: [5] })).toThrow()
  })
})
