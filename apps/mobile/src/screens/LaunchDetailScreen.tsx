import React, { useEffect, useState } from 'react'
import { View, ScrollView, Pressable, StyleSheet } from 'react-native'
import { getLaunchById } from '@starkid/core'
import type { Launch } from '@starkid/types'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { CustomText } from '../components/ui/CustomText'
import { NotifyLaunchButton } from '../components/LaunchNotifications'
import { colors, spacing } from '../theme/tokens'

export default function LaunchDetailScreen({ route }: any) {
  const id = route.params?.launchId
  const [launch, setLaunch] = useState<Launch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError(false)
    getLaunchById(id).then((result) => { if (active) setLaunch(result) })
      .catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, retry])
  return <SpaceBackground><ScrollView contentContainerStyle={styles.container}>
    <CustomText variant="sectionLabel" style={styles.accent}>LAUNCH BRIEFING</CustomText>
    {loading ? <CustomText variant="body" style={styles.body}>Loading launch...</CustomText> : error || !launch ? <GlassCard>
      <CustomText variant="body" style={styles.body}>Unable to load this launch. Check your connection and try again.</CustomText>
      <Pressable accessibilityRole="button" onPress={() => setRetry((n) => n + 1)} style={styles.button}><CustomText variant="button" style={styles.accent}>Retry</CustomText></Pressable>
    </GlassCard> : <GlassCard>
      <CustomText variant="cardTitle" style={styles.title}>{launch.name}</CustomText>
      <CustomText variant="body" style={styles.body}>{launch.providerName}</CustomText>
      <CustomText variant="body" style={styles.body}>{launch.status?.name || 'Status pending'}</CustomText>
      <CustomText variant="body" style={styles.body}>{launch.net ? new Date(launch.net).toLocaleString() : 'Launch time to be determined'}</CustomText>
      <CustomText variant="bodySmall" style={styles.body}>{launch.pad?.name}</CustomText>
      <CustomText variant="bodySmall" style={styles.body}>Launch times may change. Source: The Space Devs Launch Library.</CustomText>
      <NotifyLaunchButton launch={launch} />
    </GlassCard>}
  </ScrollView></SpaceBackground>
}
const styles = StyleSheet.create({
  container: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { color: colors.text }, body: { color: colors.muted, marginTop: spacing.sm }, accent: { color: colors.accent },
  button: { minHeight: 44, justifyContent: 'center', marginTop: spacing.md },
})
