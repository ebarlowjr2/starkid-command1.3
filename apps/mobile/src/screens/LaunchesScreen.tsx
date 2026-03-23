import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { getUpcomingLaunchesWindow, getProviderSpotlights } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

type LaunchItem = {
  id?: string | number
  name?: string
  net?: string
  window_start?: string
  pad?: { name?: string }
}

export default function LaunchesScreen() {
  const [loading, setLoading] = useState(true)
  const [launches, setLaunches] = useState<LaunchItem[]>([])
  const [spotlights, setSpotlights] = useState<LaunchItem[]>([])
  const now = Date.now()

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [launchesResult, spotlightsResult] = await Promise.all([
          getUpcomingLaunchesWindow({ days: 7, limit: 12 }),
          getProviderSpotlights(),
        ])
        if (active) {
          setLaunches(launchesResult.data || [])
          setSpotlights(spotlightsResult.data || [])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <CustomText variant="body" style={styles.muted}>Loading upcoming launches…</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={launches}
          keyExtractor={(item, index) => `${item.id ?? index}`}
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <CustomText variant="sectionLabel" style={styles.kicker}>LAUNCHES</CustomText>
              <CustomText variant="hero" style={styles.title}>Upcoming Launches</CustomText>
              <CustomText variant="body" style={styles.subtitle}>Next 7 days of launch windows and pads.</CustomText>
              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <View style={styles.badgeRow}>
                  <Badge label="MISSION FEED" />
                  <CustomText variant="sectionLabel" style={styles.badgeHelper}>Sorted by earliest launch time</CustomText>
                </View>
              </GlassCard>
              {spotlights.length ? (
                <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                  <View style={styles.badgeRow}>
                    <Badge label="PROVIDER SPOTLIGHTS" />
                  </View>
                  <View style={{ marginTop: spacing.sm }}>
                    {spotlights.map((launch, idx) => (
                      <CustomText key={`${launch.providerName || launch.name}-${idx}`} variant="bodySmall" style={styles.cardMeta}>
                        • {launch.providerName || launch.providerType || 'Provider'} • {launch.name || 'Next Launch'} — {launch.net || launch.window_start || 'Date TBD'}
                      </CustomText>
                    ))}
                  </View>
                </GlassCard>
              ) : null}
            </View>
          )}
          renderItem={({ item }) => (
            <GlassCard variant="secondary" style={styles.card}>
              <View style={styles.glowStrip} />
              <CustomText variant="cardTitle" style={styles.cardTitle}>{item.name || 'Unknown Launch'}</CustomText>
              <View style={styles.metaRow}>
                <CustomText variant="bodySmall" style={styles.cardMeta}>{item.net || item.window_start || 'Date TBD'}</CustomText>
                {item.net && new Date(item.net).getTime() - now <= 24 * 60 * 60 * 1000 ? (
                  <CustomText variant="sectionLabel" style={styles.alertBadge}>LAUNCH &lt;24H</CustomText>
                ) : null}
              </View>
              {item.pad?.name ? <CustomText variant="bodySmall" style={styles.cardMeta}>{item.pad.name}</CustomText> : null}
            </GlassCard>
          )}
        />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  header: { marginBottom: spacing.lg },
  kicker: { color: colors.dim, marginBottom: 6 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeHelper: { color: colors.dim, flex: 1 },
  muted: { marginTop: 8, color: colors.muted },
  card: {
    marginBottom: 12,
  },
  glowStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(61,235,255,0.35)',
  },
  cardTitle: { color: colors.text },
  cardMeta: { color: colors.muted, marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  alertBadge: {
    color: colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
})
