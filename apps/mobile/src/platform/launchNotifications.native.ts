import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { AppState, Platform } from 'react-native'
import { getSession, onAuthChange, getItem, setItem, launchAlertsEnabled, getLaunchAlertInstallationId,
  registerLaunchPushDevice, unregisterLaunchPushDevice, setLaunchAlertSignOutHandler, launchIdFromNotification } from '@starkid/core'

const CONSENT_KEY = 'starkid:launchAlerts:phoneEnabled'
const LAST_TAP = 'starkid:launchAlerts:lastTap'
let epoch = 0
let stopping = false
let registration: Promise<void> = Promise.resolve()

export async function phoneLaunchAlertsEnabled() {
  return (await getItem(CONSENT_KEY)) === 'true' && (await Notifications.getPermissionsAsync()).granted
}
async function register(prompt: boolean, version: number) {
  if (!launchAlertsEnabled() || stopping || epoch !== version) return
  const session = await getSession()
  if (!session?.userId) { if (prompt) throw new Error('Sign in to enable launch notifications.'); return }
  if (!prompt && await getItem(CONSENT_KEY) !== 'true') return
  if (!Device.isDevice || Constants.appOwnership === 'expo') {
    if (prompt) throw new Error('Use a TestFlight or development build on your phone to enable push notifications.')
    return
  }
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('launch-alerts', {
    name: 'Launch reminders', importance: Notifications.AndroidImportance.DEFAULT,
  })
  let permission = await Notifications.getPermissionsAsync()
  if (!permission.granted && prompt && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync()
  if (!permission.granted) {
    if (await getItem(CONSENT_KEY) === 'true') { await unregisterLaunchPushDevice(); await setItem(CONSENT_KEY, 'false') }
    if (prompt) throw new Error('Notifications are off. Enable them in your phone settings to receive launch reminders.')
    return
  }
  const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId
  if (!projectId) throw new Error('Push notifications are not configured in this build.')
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
  if (epoch !== version || stopping) return
  await registerLaunchPushDevice(token, Platform.OS === 'ios' ? 'ios' : 'android', await getLaunchAlertInstallationId(), session.userId)
  if (epoch === version && !stopping) await setItem(CONSENT_KEY, 'true')
}
function enqueueRegistration(prompt: boolean) {
  const version = epoch
  registration = registration.catch(() => {}).then(() => register(prompt, version))
  return registration
}
export function enablePhoneLaunchAlerts() { return enqueueRegistration(true) }
export async function disablePhoneLaunchAlerts() {
  stopping = true; ++epoch
  try {
    await registration.catch(() => {})
    // Also remove a registration that finished while consent was being cancelled.
    if ((await getSession())?.userId) await unregisterLaunchPushDevice()
    await setItem(CONSENT_KEY, 'false')
  } finally { stopping = false }
}
export function startLaunchNotifications(openLaunch: (id: string) => void) {
  if (!launchAlertsEnabled()) return () => {}
  let active = true
  const refresh = () => { void enqueueRegistration(false).catch(() => {}) }
  setLaunchAlertSignOutHandler(disablePhoneLaunchAlerts)
  Notifications.setNotificationHandler({ handleNotification: async (notification) => ({
    shouldShowAlert: Boolean(launchIdFromNotification(notification.request.content.data)) && await phoneLaunchAlertsEnabled(),
    shouldPlaySound: false, shouldSetBadge: false,
  }) })
  const open = async (response: Notifications.NotificationResponse | null) => {
    if (!active || !response) return
    const id = launchIdFromNotification(response.notification.request.content.data)
    const requestId = response.notification.request.identifier
    if (!id || await getItem(LAST_TAP) === requestId) return
    await setItem(LAST_TAP, requestId)
    if (active) openLaunch(id)
  }
  void Notifications.getLastNotificationResponseAsync().then(open).catch(() => {})
  const taps = Notifications.addNotificationResponseReceivedListener((r) => { void open(r).catch(() => {}) })
  const tokens = Notifications.addPushTokenListener(refresh)
  const appState = AppState.addEventListener('change', (state) => { if (state === 'active') refresh() })
  let authTimer: ReturnType<typeof setTimeout>
  const auth = onAuthChange(() => { clearTimeout(authTimer); authTimer = setTimeout(refresh, 0) })
  refresh()
  return () => { active = false; ++epoch; clearTimeout(authTimer); taps.remove(); tokens.remove(); appState.remove(); auth() }
}
