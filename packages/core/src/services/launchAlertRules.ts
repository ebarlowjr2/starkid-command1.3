// Pure rules shared by the Supabase worker and tests. No client credentials or SDKs.
export type LaunchSnapshot = {
  id: string
  name: string
  net: string | null
  status: number
  precision: number | null
  fetchedAt: string
  revision: number
}
export type LaunchAlertPreferences = {
  enabled: boolean
  reminder_minutes: number[]
  schedule_changes: boolean
}
export type LaunchAlertEvent = {
  key: string
  kind: 'reminder' | 'schedule' | 'status'
  minutes: number | null
  title: string
  body: string
  expiresAt: string
  snapshot: LaunchSnapshot
}

export const LAUNCH_REMINDER_OPTIONS = [60, 10] as const
export const DEFAULT_LAUNCH_ALERT_PREFERENCES: LaunchAlertPreferences = {
  enabled: true, reminder_minutes: [60, 10], schedule_changes: false,
}
export const LAUNCH_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const EXPO_TOKEN_PATTERN = /^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/
const MINUTE = 60_000
const MAX_FRESH_AGE = 90_000
const TERMINAL = new Set([3, 4, 7]) // success, failure, partial failure (LL2).

export function validateLaunchAlertPreferences(value: LaunchAlertPreferences) {
  if (typeof value.enabled !== 'boolean' || typeof value.schedule_changes !== 'boolean' ||
    !Array.isArray(value.reminder_minutes) || value.reminder_minutes.length > 2 ||
    new Set(value.reminder_minutes).size !== value.reminder_minutes.length ||
    value.reminder_minutes.some((n) => !LAUNCH_REMINDER_OPTIONS.includes(n as 60 | 10))) {
    throw new Error('Choose 1-hour or 10-minute reminders.')
  }
  return { enabled: value.enabled, reminder_minutes: [...value.reminder_minutes], schedule_changes: value.schedule_changes }
}

export function normalizeAlertSnapshot(raw: any, now: number, previous?: LaunchSnapshot | null): LaunchSnapshot {
  if (!LAUNCH_ID_PATTERN.test(raw?.id || '') || typeof raw?.name !== 'string' || !Number.isInteger(raw?.status?.id)) {
    throw new Error('Invalid launch source response')
  }
  const time = Date.parse(raw.net)
  const net = Number.isFinite(time) ? new Date(time).toISOString() : null
  const precision = Number.isInteger(raw.net_precision?.id) ? raw.net_precision.id : null
  const changed = previous && (previous.net !== net || previous.status !== raw.status.id || previous.precision !== precision)
  return { id: raw.id, name: raw.name.slice(0, 180), net, status: raw.status.id, precision,
    fetchedAt: new Date(now).toISOString(), revision: previous ? previous.revision + (changed ? 1 : 0) : 1 }
}

export function alertSnapshotIsFresh(snapshot: LaunchSnapshot, now: number) {
  const age = now - Date.parse(snapshot.fetchedAt)
  return age >= 0 && age <= MAX_FRESH_AGE
}

export function planLaunchAlerts(current: LaunchSnapshot, previous: LaunchSnapshot | null, now: number): LaunchAlertEvent[] {
  if (!alertSnapshotIsFresh(current, now)) return []
  const events: LaunchAlertEvent[] = []
  const remaining = current.net ? Date.parse(current.net) - now : NaN
  // Only GO with second/minute-level precision is eligible for countdown reminders.
  if (current.status === 1 && current.precision !== null && [0, 1].includes(current.precision)) {
    for (const minutes of LAUNCH_REMINDER_OPTIONS) {
      if (remaining <= minutes * MINUTE && remaining > (minutes - 5) * MINUTE) {
        const expiresAt = new Date(Date.parse(current.net!) - (minutes - 5) * MINUTE).toISOString()
        events.push({ key: `reminder:${minutes}:${current.net}`, kind: 'reminder', minutes,
          title: 'Launch approaching', body: `${current.name} is targeting liftoff in about ${Math.ceil(remaining / MINUTE)} minutes. Times may change.`,
          expiresAt, snapshot: current })
      }
    }
  }
  // First observations and old observations never generate a burst of change alerts.
  if (!previous || now - Date.parse(previous.fetchedAt) > 24 * 60 * MINUTE) return events
  const statuses: Record<number, string> = { 1: 'Go for launch', 2: 'Launch date to be determined', 3: 'Launch successful',
    4: 'Launch failure reported', 5: 'Launch on hold', 6: 'Launch in flight', 7: 'Partial failure reported', 8: 'Launch time to be determined' }
  if (previous.status !== current.status) {
    events.push({ key: `status:${current.revision}`, kind: 'status', minutes: null,
      title: statuses[current.status] || 'Launch status updated',
      body: `${current.name}: ${statuses[current.status] || 'check the latest mission details'}.`,
      expiresAt: new Date(now + 15 * MINUTE).toISOString(), snapshot: current })
  } else if (!TERMINAL.has(current.status) && previous.net !== current.net &&
    (!previous.net || !current.net || Math.abs(Date.parse(previous.net) - Date.parse(current.net)) >= 5 * MINUTE)) {
    events.push({ key: `schedule:${current.revision}`, kind: 'schedule', minutes: null,
      title: 'Launch schedule changed', body: `${current.name} has a revised launch target. Open StarKid for the latest time.`,
      expiresAt: new Date(now + 15 * MINUTE).toISOString(), snapshot: current })
  }
  return events
}

export function launchAlertStillValid(event: LaunchAlertEvent, latest: LaunchSnapshot, prefs: LaunchAlertPreferences,
  subscribedAt: string, now: number) {
  if (!prefs.enabled || !alertSnapshotIsFresh(latest, now) || Date.parse(event.expiresAt) <= now ||
    Date.parse(subscribedAt) > Date.parse(event.snapshot.fetchedAt) || latest.id !== event.snapshot.id ||
    latest.net !== event.snapshot.net || latest.status !== event.snapshot.status || latest.precision !== event.snapshot.precision) return false
  return event.kind === 'reminder' ? prefs.reminder_minutes.includes(event.minutes!) : prefs.schedule_changes
}

export function launchIdFromNotification(data: unknown): string | null {
  const value = data as { type?: string; launchId?: string } | null
  return value?.type === 'launch-alert' && LAUNCH_ID_PATTERN.test(value.launchId || '') ? value!.launchId! : null
}

export function launchWatchSupported(launch: { id?: string | number; source?: string }) {
  return launch.source === 'launch-library' && LAUNCH_ID_PATTERN.test(String(launch.id || ''))
}
