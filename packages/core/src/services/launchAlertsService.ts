import { getSupabaseClient } from '../clients/supabase/supabase.js'
import { getCoreConfig } from '../config/coreConfig'
import { getItem, setItem } from '../storage/storage'
import { generateUuid } from '../utils/uuid'
import { DEFAULT_LAUNCH_ALERT_PREFERENCES, EXPO_TOKEN_PATTERN, LAUNCH_ID_PATTERN, validateLaunchAlertPreferences } from './launchAlertRules'
import type { LaunchAlertPreferences } from './launchAlertRules'

export type WatchedLaunch = { launch_id: string; launch_name: string; active: boolean; subscribed_at: string }
export type LaunchAlertsState = { userId: string | null; preferences: LaunchAlertPreferences; subscriptions: WatchedLaunch[] }
const INSTALLATION_KEY = 'starkid:launchAlerts:installation'
let beforeSignOut: (() => Promise<void>) | null = null
export function launchAlertsEnabled() { return getCoreConfig().launchAlertsEnabled === true }

async function authenticatedClient() {
  if (!launchAlertsEnabled()) throw new Error('Launch notifications are not available yet.')
  const client = getSupabaseClient()
  const { data, error } = client ? await client.auth.getSession() : { data: null, error: null }
  if (error || !data?.session?.user?.id) throw new Error('Sign in to watch launches.')
  return { client: client!, userId: data.session.user.id }
}
function check(error: any) {
  if (error) throw new Error('Launch preferences could not be saved or loaded. Please try again.')
}
export async function getLaunchAlertsState(): Promise<LaunchAlertsState> {
  const empty = { userId: null, preferences: { ...DEFAULT_LAUNCH_ALERT_PREFERENCES, reminder_minutes: [60, 10] }, subscriptions: [] }
  if (!launchAlertsEnabled()) return empty
  const client = getSupabaseClient()
  if (!client) return empty
  const { data, error: authError } = await client.auth.getSession()
  if (authError) throw new Error('Unable to check your sign-in. Please try again.')
  const userId = data?.session?.user?.id
  if (!userId) return empty
  const [prefs, watches] = await Promise.all([
    client.from('launch_alert_preferences').select('enabled,reminder_minutes,schedule_changes').eq('user_id', userId).maybeSingle(),
    client.from('launch_alert_subscriptions').select('launch_id,launch_name,active,subscribed_at').eq('user_id', userId).eq('active', true).order('subscribed_at', { ascending: false }),
  ])
  check(prefs.error); check(watches.error)
  return { userId, preferences: prefs.data || empty.preferences, subscriptions: watches.data || [] }
}
export async function saveLaunchAlertPreferences(value: LaunchAlertPreferences) {
  const preferences = validateLaunchAlertPreferences(value)
  const { client, userId } = await authenticatedClient()
  const { error } = await client.from('launch_alert_preferences').upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() })
  check(error)
  return preferences
}
export async function watchLaunch(launchId: string, launchName: string, active = true) {
  if (!LAUNCH_ID_PATTERN.test(launchId)) throw new Error('Alerts are unavailable for this launch source.')
  const { client } = await authenticatedClient()
  const { error } = await client.rpc('set_launch_watch', { p_launch_id: launchId, p_launch_name: launchName.slice(0, 180), p_active: active })
  if (error?.message?.includes('watch limit')) throw new Error('You can watch up to 50 launches. Remove one in Profile first.')
  check(error)
}
export async function getLaunchAlertInstallationId() {
  let id = await getItem(INSTALLATION_KEY)
  if (!id || !LAUNCH_ID_PATTERN.test(id)) { id = generateUuid(); await setItem(INSTALLATION_KEY, id) }
  return id
}
export async function registerLaunchPushDevice(token: string, platform: 'ios' | 'android', installationId: string, expectedUserId: string) {
  if (!EXPO_TOKEN_PATTERN.test(token) || !LAUNCH_ID_PATTERN.test(installationId)) throw new Error('Unable to register this device.')
  const { client, userId } = await authenticatedClient()
  if (userId !== expectedUserId) throw new Error('Your account changed. Please enable notifications again.')
  const { error } = await client.rpc('register_launch_push_device', { p_installation_id: installationId, p_token: token, p_platform: platform })
  check(error)
}
export async function unregisterLaunchPushDevice() {
  const id = await getItem(INSTALLATION_KEY)
  if (!id) return
  const { client, userId } = await authenticatedClient()
  const { error } = await client.from('launch_push_devices').delete().eq('installation_id', id).eq('user_id', userId)
  if (error) throw new Error('Unable to disconnect launch notifications. Check your connection and try again.')
}
export function setLaunchAlertSignOutHandler(handler: () => Promise<void>) { beforeSignOut = handler }
export async function disconnectLaunchAlertsBeforeSignOut() {
  if (launchAlertsEnabled() && beforeSignOut) await beforeSignOut()
}
