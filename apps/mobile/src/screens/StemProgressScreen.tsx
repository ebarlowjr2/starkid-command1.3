import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing, typography } from '../theme/tokens'
import { getStemProgressOverview, ROUTE_MANIFEST } from '@starkid/core'

const TRACK_LABELS: Record<string, string> = {
  math: 'Math',
  science: 'Science',
  cyber: 'Cyber',
  linux: 'Linux',
  ai: 'AI',
}

export default function StemProgressScreen({ navigation }: { navigation: any }) {
  const [overview, setOverview] = useState<any | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getStemProgressOverview()
      if (active) setOverview(data)
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
          <Text style={styles.muted}>Loading progress…</Text>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>STEM PROGRESS</Text>
          <Text style={styles.title}>Your Learning Map</Text>
          <Text style={styles.subtitle}>Track completion by STEM track and level.</Text>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {overview.tracks.map((track: any) => (
              <GlassCard key={track.track} variant="secondary">
                <View style={styles.trackHeader}>
                  <Text style={styles.trackTitle}>{TRACK_LABELS[track.track] || track.track}</Text>
                  <Text style={styles.levelBadge}>{track.currentLevel || 'cadet'}</Text>
                </View>
                <View style={styles.trackMetaRow}>
                  <Text style={styles.trackMeta}>{track.completed} / {track.total} complete</Text>
                  <Text style={styles.trackMeta}>{track.percent}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${track.percent}%` }]} />
                </View>
              </GlassCard>
            ))}
          </View>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Recommended Next</Text>
            {overview.recommendedNextActivity ? (
              <>
                <Text style={styles.recommendTitle}>{overview.recommendedNextActivity.title}</Text>
                <Text style={styles.recommendMeta}>
                  {overview.recommendedNextActivity.track} • {overview.recommendedNextActivity.level}
                </Text>
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
              <Text style={styles.muted}>All activities complete.</Text>
            )}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Recent Completions</Text>
            {overview.recentCompletions?.length ? (
              overview.recentCompletions.slice(0, 3).map((item: any) => (
                <View key={item.activityId} style={styles.recentRow}>
                  <View>
                    <Text style={styles.recentTitle}>{item.title}</Text>
                    <Text style={styles.recentMeta}>{item.track} • {item.level}</Text>
                  </View>
                  <Text style={styles.recentDate}>
                    {new Date(item.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.muted}>No completions yet.</Text>
            )}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  trackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackTitle: { ...typography.h2, color: colors.text },
  levelBadge: {
    ...typography.pixel,
    color: colors.text,
    backgroundColor: 'rgba(61,235,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trackMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackMeta: { ...typography.small, color: colors.muted },
  progressBar: { height: 8, borderRadius: 10, backgroundColor: 'rgba(61,235,255,0.15)', marginTop: 8 },
  progressFill: { height: 8, borderRadius: 10, backgroundColor: colors.accent },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  recommendTitle: { ...typography.h2, color: colors.text },
  recommendMeta: { ...typography.small, color: colors.muted, marginTop: 6 },
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
  recentTitle: { ...typography.body, color: colors.muted },
  recentMeta: { ...typography.pixel, color: colors.dim },
  recentDate: { ...typography.pixel, color: colors.dim },
  muted: { ...typography.body, color: colors.muted },
})
