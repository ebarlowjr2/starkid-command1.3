import { normalizeAlertSnapshot, planLaunchAlerts, launchAlertStillValid } from '../../../packages/core/src/services/launchAlertRules.ts'
import type { LaunchSnapshot } from '../../../packages/core/src/services/launchAlertRules.ts'

const PUSH_URL = 'https://exp.host/--/api/v2/push/'
type Options = { db: any; fetcher?: typeof fetch; clock?: () => number; expoToken?: string; sourceToken?: string; pollSeconds?: number }
function checked(result: any): any {
  if (result.error) throw new Error('Launch alert database operation failed')
  return result.data
}
async function readAll(makeQuery: () => any) {
  const rows: any[] = []
  for (let offset = 0; offset < 20_000; offset += 1000) {
    const page = checked(await makeQuery().range(offset, offset + 999)) || []
    rows.push(...page)
    if (page.length < 1000) return rows
  }
  throw new Error('Launch alert capacity requires review')
}
export async function runLaunchAlertWorker({ db, fetcher = fetch, clock = Date.now, expoToken, sourceToken, pollSeconds = 300 }: Options) {
  if (!Number.isInteger(pollSeconds) || pollSeconds < 60 || pollSeconds > 3600) throw new Error('Invalid polling interval')
  const runId = crypto.randomUUID()
  if (!checked(await db.rpc('claim_launch_alert_run', { p_run_id: runId, p_interval_seconds: pollSeconds }))) return { skipped: 'not_due' }
  const started = clock()
  const update = async (id: string, value: Record<string, unknown>) => checked(await db.from('launch_alert_deliveries')
    .update({ ...value, updated_at: new Date(clock()).toISOString() }).eq('id', id))
  const request = (url: string, init: RequestInit = {}) => fetcher(url, { ...init, signal: AbortSignal.timeout(15_000) })
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (expoToken) headers.Authorization = `Bearer ${expoToken}`
  let accepted = 0
  try {
    // Prune even when no launches are watched.
    checked(await db.from('launch_alert_deliveries').delete().lt('created_at', new Date(clock() - 30 * 86400_000).toISOString())
      .in('state', ['accepted', 'failed', 'expired', 'unknown']))
    checked(await db.from('launch_push_devices').delete().lt('last_seen_at', new Date(clock() - 30 * 86400_000).toISOString()))
    const tickets = checked(await db.from('launch_alert_deliveries').select('id,device_id,ticket_id,updated_at')
      .eq('state', 'ticket').lt('updated_at', new Date(clock() - 15 * 60_000).toISOString()).limit(100)) || []
    if (tickets.length) {
      try {
        const response = await request(`${PUSH_URL}getReceipts`, { method: 'POST', headers, body: JSON.stringify({ ids: tickets.map((t: any) => t.ticket_id) }) })
        if (response.ok) {
          const { data = {} } = await response.json()
          for (const ticket of tickets) {
            const receipt = data[ticket.ticket_id]
            if (!receipt) {
              if (clock() - Date.parse(ticket.updated_at) > 23 * 3600_000) await update(ticket.id, { state: 'unknown', error_code: 'receipt_unavailable' })
              continue
            }
            const code = receipt.details?.error || null
            await update(ticket.id, { state: receipt.status === 'ok' ? 'accepted' : 'failed', error_code: code })
            if (code === 'DeviceNotRegistered') checked(await db.from('launch_push_devices').update({ enabled: false }).eq('id', ticket.device_id))
          }
        }
      } catch { /* Receipt failures must not prevent a fresh launch check. */ }
    }
    const [subscriptions, stored] = await Promise.all([
      readAll(() => db.from('launch_alert_subscriptions').select('user_id,launch_id').eq('active', true).order('user_id').order('launch_id')),
      readAll(() => db.from('launch_alert_snapshots').select('launch_id,payload').order('launch_id')),
    ])
    const previous = new Map<string, LaunchSnapshot>(stored.map((r) => [r.launch_id, r.payload]))
    const watchedIds = [...new Set<string>(subscriptions.map((s) => s.launch_id))]
    const ids = watchedIds.filter((id) => ![3, 4, 7].includes(previous.get(id)?.status || 0))
      .sort((a, b) => Date.parse(previous.get(a)?.fetchedAt || '1970-01-01') - Date.parse(previous.get(b)?.fetchedAt || '1970-01-01')).slice(0, 50)
    if (!ids.length) return { checkedLaunches: 0, handedToExpo: 0 }
    const url = new URL('https://ll.thespacedevs.com/2.3.0/launches/')
    url.searchParams.set('id', ids.join(',')); url.searchParams.set('limit', String(ids.length)); url.searchParams.set('mode', 'normal')
    const source = await request(url.toString(), { headers: sourceToken ? { Authorization: `Token ${sourceToken}` } : {} })
    if (!source.ok) throw new Error(`Launch source unavailable (${source.status}); no reminders sent`)
    const body = await source.json()
    if (!Array.isArray(body.results) || body.next) throw new Error('Incomplete launch source response; no reminders sent')
    const now = clock()
    const fresh: LaunchSnapshot[] = body.results.filter((r: any) => ids.includes(r.id)).map((r: any) => normalizeAlertSnapshot(r, now, previous.get(r.id)))
    const events = fresh.flatMap((s) => planLaunchAlerts(s, previous.get(s.id) || null, now))
    checked(await db.rpc('record_launch_alert_batch', { p_run_id: runId, p_snapshots: fresh, p_events: events }))
    // Bound throughput and duration; queued rows expire rather than send stale reminders.
    for (let batch = 0; batch < 10 && clock() - started < 45_000; batch++) {
      const rows = checked(await db.rpc('claim_launch_alert_deliveries', { p_launch_ids: fresh.map((s) => s.id) })) || []
      if (!rows.length) break
      const valid = []
      for (const row of rows) {
        if (!launchAlertStillValid(row.event, row.snapshot, row.preferences, row.subscribedAt, clock())) {
          await update(row.id, { state: 'expired', error_code: 'superseded_or_disabled' })
        } else valid.push(row)
      }
      if (!valid.length) continue
      const messages = valid.map((row) => ({ to: row.token, title: row.event.title, body: row.event.body, sound: 'default',
        channelId: 'launch-alerts', expiration: Math.floor(Date.parse(row.event.expiresAt) / 1000),
        data: { type: 'launch-alert', launchId: row.snapshot.id }, collapseId: `launch:${row.snapshot.id}`, priority: 'high' }))
      let response: Response
      try { response = await request(`${PUSH_URL}send`, { method: 'POST', headers, body: JSON.stringify(messages) }) }
      catch {
        for (const row of valid) await update(row.id, { state: 'unknown', error_code: 'ambiguous_network_result' })
        break
      }
      if (!response.ok) {
        const retry = response.status === 429 || response.status >= 500
        for (const row of valid) await update(row.id, { state: retry && row.attempts < 3 ? 'pending' : 'failed',
          next_attempt_at: new Date(clock() + 60_000 * 2 ** row.attempts).toISOString(), error_code: `expo_http_${response.status}` })
        break
      }
      let results: any[] = []
      try { const result = await response.json(); results = Array.isArray(result.data) ? result.data : [] } catch { /* Do not resend an ambiguous success. */ }
      for (const [index, row] of valid.entries()) {
        const ticket = results[index]
        if (ticket?.status === 'ok' && typeof ticket.id === 'string') {
          await update(row.id, { state: 'ticket', ticket_id: ticket.id }); accepted++
        } else {
          const code = ticket?.details?.error || 'ambiguous_push_result'
          await update(row.id, { state: ticket?.status === 'error' ? 'failed' : 'unknown', error_code: code })
          if (code === 'DeviceNotRegistered') checked(await db.from('launch_push_devices').update({ enabled: false }).eq('expo_token', row.token))
        }
      }
    }
    return { checkedLaunches: fresh.length, handedToExpo: accepted, watchedLaunches: watchedIds.length }
  } finally {
    checked(await db.from('launch_alert_worker_state').update({ locked_until: new Date(0).toISOString() }).eq('run_id', runId))
  }
}
