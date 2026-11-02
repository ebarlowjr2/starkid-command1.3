import React, { useCallback, useState, useSyncExternalStore } from 'react'
import { View, Pressable, Switch, StyleSheet, Linking } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { launchAlertsController, launchAlertsEnabled, launchWatchSupported } from '@starkid/core'
import type { Launch } from '@starkid/types'
import { CustomText } from './ui/CustomText'
import { GlassCard } from './home/GlassCard'
import { SyncIdentityModal } from './auth/SyncIdentityModal'
import { colors, spacing } from '../theme/tokens'
import { enablePhoneLaunchAlerts, disablePhoneLaunchAlerts, phoneLaunchAlertsEnabled } from '../platform/launchNotifications.native'

function useAlerts() { return useSyncExternalStore(launchAlertsController.subscribe, launchAlertsController.getSnapshot) }
function Button({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.button, disabled && { opacity: 0.5 }]}>
    <CustomText variant="button" style={{ color: colors.text }}>{label}</CustomText>
  </Pressable>
}
export function NotifyLaunchButton({ launch }: { launch: Launch }) {
  if (!launchAlertsEnabled() || !launchWatchSupported(launch)) return null
  return <WatchControl launch={launch} />
}
function WatchControl({ launch }: { launch: Launch }) {
  const state = useAlerts()
  const [auth, setAuth] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const watched = state.subscriptions.some((s) => s.launch_id === launch.id)
  const toggle = async () => {
    if (!state.userId) { setAuth(true); return }
    setBusy(true); setError(null)
    try {
      if (!watched) await enablePhoneLaunchAlerts()
      await launchAlertsController.setWatch(String(launch.id), launch.name || 'Launch', !watched)
    } catch (e: any) { setError(e.message || 'Unable to enable notifications.') }
    finally { setBusy(false) }
  }
  return <View style={styles.section}>
    <Button label={busy || state.busy ? 'Saving...' : watched ? 'Watching - stop alerts' : 'Notify Me'} disabled={busy || state.busy || state.loading} onPress={toggle} />
    {watched ? <CustomText variant="bodySmall" style={styles.note}>{state.preferences.enabled ? 'Reminders follow your Profile notification preferences.' : 'Launch notifications are paused in Profile.'}</CustomText> : null}
    {error || state.error ? <CustomText accessibilityRole="alert" variant="bodySmall" style={styles.error}>{error || state.error}</CustomText> : null}
    {error ? <Button label="Open phone settings" onPress={() => { void Linking.openSettings() }} /> : null}
    {state.error ? <Button label="Retry" onPress={() => { void launchAlertsController.refresh() }} /> : null}
    <SyncIdentityModal open={auth} onClose={() => setAuth(false)} onSync={() => { setAuth(false); void launchAlertsController.refresh() }} />
  </View>
}

export function LaunchNotificationPreferences() {
  if (!launchAlertsEnabled()) return null
  return <Preferences />
}
function Preferences() {
  const state = useAlerts()
  const navigation = useNavigation<any>()
  const [phone, setPhone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auth, setAuth] = useState(false)
  useFocusEffect(useCallback(() => {
    let active = true
    void launchAlertsController.refresh()
    phoneLaunchAlertsEnabled().then((value) => { if (active) setPhone(value) }).catch(() => { if (active) setPhone(false) })
    return () => { active = false }
  }, []))
  const togglePhone = async () => {
    setBusy(true); setError(null)
    try {
      if (phone) await disablePhoneLaunchAlerts(); else await enablePhoneLaunchAlerts()
      setPhone(await phoneLaunchAlertsEnabled())
    } catch (e: any) { setError(e.message || 'Unable to change phone notifications.') }
    finally { setBusy(false) }
  }
  const prefs = state.preferences
  const options: [string, boolean, () => void][] = [
    ['Enable launch notifications', prefs.enabled, () => { void launchAlertsController.savePreferences({ ...prefs, enabled: !prefs.enabled }) }],
    ...[60, 10].map((n): [string, boolean, () => void] => [n === 60 ? '1 hour before launch' : '10 minutes before launch', prefs.reminder_minutes.includes(n),
      () => { void launchAlertsController.savePreferences({ ...prefs, reminder_minutes: prefs.reminder_minutes.includes(n) ? prefs.reminder_minutes.filter((v) => v !== n) : [...prefs.reminder_minutes, n] }) }]),
    ['Schedule and status updates', prefs.schedule_changes, () => { void launchAlertsController.savePreferences({ ...prefs, schedule_changes: !prefs.schedule_changes }) }],
  ]
  return <GlassCard variant="secondary" style={styles.section}>
    <CustomText variant="sectionLabel" style={styles.heading}>Launch Notifications</CustomText>
    <CustomText variant="bodySmall" style={styles.note}>Watch individual launches and choose your reminders. Launch times and notification delivery may vary.</CustomText>
    {state.loading ? <CustomText variant="body" style={styles.note}>Loading launch preferences...</CustomText> : !state.userId ?
      <Button label="Sign in to watch launches" onPress={() => setAuth(true)} /> : <>
        <Button label={busy ? 'Updating...' : phone ? 'Turn off on this phone' : 'Enable on this phone'} disabled={busy || state.busy} onPress={togglePhone} />
        {options.map(([label, value, action]) => <View key={label} style={styles.row}>
          <CustomText variant="body" style={styles.label}>{label}</CustomText>
          <Switch accessibilityLabel={label} value={value} onValueChange={action} disabled={busy || state.busy} trackColor={{ true: colors.accent }} />
        </View>)}
        <CustomText variant="sectionLabel" style={styles.heading}>Watched launches</CustomText>
        {!state.subscriptions.length ? <CustomText variant="bodySmall" style={styles.note}>No watched launches yet. Choose Notify Me on a launch.</CustomText> : null}
        {state.subscriptions.map((s) => <View key={s.launch_id} style={styles.watch}>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('LaunchDetail', { launchId: s.launch_id })} style={styles.launchLink}>
            <CustomText variant="body" style={{ color: colors.accent }}>{s.launch_name}</CustomText>
          </Pressable>
          <Button label="Remove" disabled={busy || state.busy} onPress={() => { void launchAlertsController.setWatch(s.launch_id, s.launch_name, false) }} />
        </View>)}
      </>}
    {error || state.error ? <CustomText accessibilityRole="alert" variant="bodySmall" style={styles.error}>{error || state.error}</CustomText> : null}
    {error ? <Button label="Open phone settings" onPress={() => { void Linking.openSettings() }} /> : null}
    {state.error ? <Button label="Retry" onPress={() => { void launchAlertsController.refresh() }} /> : null}
    <SyncIdentityModal open={auth} onClose={() => setAuth(false)} onSync={() => { setAuth(false); void launchAlertsController.refresh() }} />
  </GlassCard>
}
const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  heading: { color: colors.accent, marginTop: spacing.sm },
  note: { color: colors.muted, marginTop: spacing.sm },
  error: { color: '#fca5a5', marginTop: spacing.sm },
  button: { minHeight: 44, padding: spacing.sm, marginTop: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.stroke, alignSelf: 'flex-start', justifyContent: 'center' },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  label: { color: colors.text, flex: 1 },
  watch: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.stroke },
  launchLink: { minHeight: 44, justifyContent: 'center' },
})
