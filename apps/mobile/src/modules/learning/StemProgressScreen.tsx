import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { PixelButton } from '../../components/home/PixelButton'
import { colors, spacing } from '../../theme/tokens'
import { getStemProgressOverview, ROUTE_MANIFEST, getCurrentActor } from '@starkid/core'
import { SyncIdentityModal } from '../../components/auth/SyncIdentityModal'
import { CustomText } from '../../components/ui/CustomText'

const TRACK_LABELS: Record<string, string> = {
  math: 'Math',
  science: 'Science',
  cyber: 'Cyber',
  linux: 'Linux',
  ai: 'AI',
}

export default function StemProgressScreen({ navigation }: { navigation: any }) {
  const [overview, setOverview] = useState<any | null>(null)
  const [isGuest, setIsGuest] = useState(true)
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getStemProgressOverview()
      const actor = await getCurrentActor()
      if (active) {
        setOverview(data)
        setIsGuest(actor?.mode !== 'user')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!overview) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <CustomText variant="body" style={styles.muted}>Loading progress…</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>STEM PROGRESS</CustomText>
          <CustomText variant="hero" style={styles.title}>Your Learning Map</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Track completion by STEM track and level.</CustomText>
          {isGuest ? (
            <CustomText variant="bodySmall" style={styles.guestNote}>
              Your progress is stored locally. Sync Command Profile to access it on other devices.
            </CustomText>
          ) : null}
          {isGuest ? (
            <PixelButton
              label="SYNC COMMAND PROFILE"
              onPress={() => setShowSync(true)}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            />
          ) : null}

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {overview.tracks.map((track: any) => (
              <GlassCard key={track.track} variant="secondary">
                <View style={styles.trackHeader}>
                  <CustomText variant="cardTitle" style={styles.trackTitle}>{TRACK_LABELS[track.track] || track.track}</CustomText>
                  <CustomText variant="sectionLabel" style={styles.levelBadge}>{track.currentLevel || 'cadet'}</CustomText>
                </View>
                <View style={styles.trackMetaRow}>
                  <CustomText variant="bodySmall" style={styles.trackMeta}>{track.completed} / {track.total} complete</CustomText>
                  <CustomText variant="bodySmall" style={styles.trackMeta}>{track.percent}%</CustomText>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${track.percent}%` }]} />
                </View>
              </GlassCard>
            ))}
          </View>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Recommended Next</CustomText>
            {overview.recommendedNextActivity ? (
              <>
                <CustomText variant="cardTitle" style={styles.recommendTitle}>{overview.recommendedNextActivity.title}</CustomText>
                <CustomText variant="bodySmall" style={styles.recommendMeta}>
                  {overview.recommendedNextActivity.track} • {overview.recommendedNextActivity.level}
                </CustomText>
                <PixelButton
                  label="CONTINUE →"
                  onPress={() =>
                    navigation?.navigate?.(ROUTE_MANIFEST.STEM_ACTIVITY_DETAIL, {
                      activityId: overview.recommendedNextActivity.id,
                    })
                  }
                  style={styles.continueButton}
                />
              </>
            ) : (
              <CustomText variant="body" style={styles.muted}>All activities complete.</CustomText>
            )}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Recent Completions</CustomText>
            {overview.recentCompletions?.length ? (
              overview.recentCompletions.slice(0, 3).map((item: any) => (
                <View key={item.activityId} style={styles.recentRow}>
                  <View>
                    <CustomText variant="body" style={styles.recentTitle}>{item.title}</CustomText>
                    <CustomText variant="bodySmall" style={styles.recentMeta}>{item.track} • {item.level}</CustomText>
                  </View>
                  <CustomText variant="bodySmall" style={styles.recentDate}>
                    {new Date(item.completedAt).toLocaleDateString()}
                  </CustomText>
                </View>
              ))
            ) : (
              <CustomText variant="body" style={styles.muted}>No completions yet.</CustomText>
            )}
          </GlassCard>
        </ScrollView>
        <SyncIdentityModal open={showSync} onClose={() => setShowSync(false)} onSync={() => setShowSync(false)} />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  guestNote: { color: colors.dim, marginTop: spacing.sm },
  trackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackTitle: { color: colors.text },
  levelBadge: {
    color: colors.text,
    backgroundColor: 'rgba(61,235,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trackMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackMeta: { color: colors.muted },
  progressBar: { height: 8, borderRadius: 10, backgroundColor: 'rgba(61,235,255,0.15)', marginTop: 8 },
  progressFill: { height: 8, borderRadius: 10, backgroundColor: colors.accent },
  sectionTitle: { color: colors.dim, marginBottom: spacing.sm },
  recommendTitle: { color: colors.text },
  recommendMeta: { color: colors.muted, marginTop: 6 },
  continueButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.7)',
    backgroundColor: 'rgba(6, 10, 22, 0.8)',
  },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' },
  recentTitle: { color: colors.muted },
  recentMeta: { color: colors.dim },
  recentDate: { color: colors.dim },
  muted: { color: colors.muted },
})
