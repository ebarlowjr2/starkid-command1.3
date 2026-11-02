import { randomUUID } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { runLaunchAlertWorker } from '../../../../../supabase/functions/_shared/launchAlertsWorker'
import { normalizeAlertSnapshot, planLaunchAlerts } from '../launchAlertRules'

const now = Date.parse('2026-11-02T12:00:00Z')
const id = '11111111-1111-4111-8111-111111111111'
const raw = { id, name: 'QA launch', net: new Date(now + 600000).toISOString(), status: { id: 1 }, net_precision: { id: 0 } }
function fixture({ disabled = false, sourceFailure = false, ambiguous = false, locked = false } = {}) {
  const snapshot = normalizeAlertSnapshot(raw, now)
  const updates: any[] = []
  const queued = [{ id: 'delivery', event: planLaunchAlerts(snapshot, null, now)[0], snapshot, token: 'ExpoPushToken[qa]',
    preferences: { enabled: !disabled, reminder_minutes: [10], schedule_changes: false }, subscribedAt: new Date(now - 1000).toISOString(), attempts: 1 }]
  const db = {
    from: vi.fn((table: string) => {
      let action = 'select'; let patch: any
      const q: any = { select: () => q, delete: () => { action = 'delete'; return q }, update: (value: any) => { action = 'update'; patch = value; return q },
        eq: () => q, lt: () => q, in: () => q, order: () => q, limit: () => q, range: () => q,
        then(resolve: any) {
          if (action === 'update') updates.push({ table, ...patch })
          const data = action === 'select' && table === 'launch_alert_subscriptions' ? [{ user_id: 'user', launch_id: id }] : []
          return Promise.resolve({ data, error: null }).then(resolve)
        } }
      return q
    }),
    rpc: vi.fn(async (name: string) => ({ data: name === 'claim_launch_alert_run' ? !locked : name === 'claim_launch_alert_deliveries' ? queued.splice(0) : null, error: null })),
  }
  const fetcher = vi.fn(async (url: any) => {
    if (String(url).includes('ll.thespacedevs')) return Response.json({ results: [raw], next: null }, { status: sourceFailure ? 503 : 200 })
    if (ambiguous) throw new Error('Disconnected after send')
    return Response.json({ data: [{ status: 'ok', id: 'expo-ticket' }] })
  })
  const run = () => { vi.stubGlobal('crypto', { randomUUID }); return runLaunchAlertWorker({ db, fetcher: fetcher as any, clock: () => now }) }
  return { run, fetcher, db, updates }
}
describe('launch alert sender', () => {
  it('sends fresh eligible reminders once per claimed delivery and records the ticket', async () => {
    const f = fixture(); expect(await f.run()).toMatchObject({ handedToExpo: 1 })
    expect(f.fetcher).toHaveBeenCalledTimes(2)
    expect(f.updates).toContainEqual(expect.objectContaining({ state: 'ticket', ticket_id: 'expo-ticket' }))
  })
  it('does not send when the source is unavailable or the worker lease is held', async () => {
    const unavailable = fixture({ sourceFailure: true }); await expect(unavailable.run()).rejects.toThrow('Launch source unavailable')
    expect(unavailable.fetcher).toHaveBeenCalledTimes(1)
    const locked = fixture({ locked: true }); expect(await locked.run()).toEqual({ skipped: 'not_due' }); expect(locked.fetcher).not.toHaveBeenCalled()
  })
  it('expires a claimed reminder if preferences were disabled before delivery', async () => {
    const f = fixture({ disabled: true }); expect(await f.run()).toMatchObject({ handedToExpo: 0 })
    expect(f.fetcher).toHaveBeenCalledTimes(1)
    expect(f.updates).toContainEqual(expect.objectContaining({ state: 'expired' }))
  })
  it('does not blindly retry an ambiguous network send', async () => {
    const f = fixture({ ambiguous: true }); await f.run()
    expect(f.updates).toContainEqual(expect.objectContaining({ state: 'unknown', error_code: 'ambiguous_network_result' }))
    expect(f.fetcher).toHaveBeenCalledTimes(2)
  })
})
