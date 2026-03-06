import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { getUpcomingLaunches } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing, typography } from '../theme/tokens'

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

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data } = await getUpcomingLaunches({ limit: 10 })
        if (active) setLaunches(data || [])
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
          <Text style={styles.muted}>Loading upcoming launches…</Text>
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
              <Text style={styles.kicker}>LAUNCHES</Text>
              <Text style={styles.title}>Upcoming Launches</Text>
              <Text style={styles.subtitle}>Track the next mission windows and launch pads.</Text>
              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <View style={styles.badgeRow}>
                  <Badge label="MISSION FEED" />
                  <Text style={styles.badgeHelper}>Sorted by earliest launch time</Text>
                </View>
              </GlassCard>
            </View>
          )}
          renderItem={({ item }) => (
            <GlassCard variant="secondary" style={styles.card}>
              <View style={styles.glowStrip} />
              <Text style={styles.cardTitle}>{item.name || 'Unknown Launch'}</Text>
              <Text style={styles.cardMeta}>{item.net || item.window_start || 'Date TBD'}</Text>
              {item.pad?.name ? <Text style={styles.cardMeta}>{item.pad.name}</Text> : null}
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
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeHelper: { ...typography.pixel, color: colors.dim, flex: 1 },
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
  cardTitle: { ...typography.h2, color: colors.text },
  cardMeta: { ...typography.small, color: colors.muted, marginTop: 6 },
})
