import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { getUpcomingSkyEventsService } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing, typography } from '../theme/tokens'

type SkyEvent = {
  id?: string | number
  title?: string
  start?: string
  type?: string
}

export default function SkyEventsScreen() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<SkyEvent[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data } = await getUpcomingSkyEventsService({ days: 60 })
        if (active) setEvents(data || [])
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
          <Text style={styles.muted}>Loading sky events…</Text>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={events}
          keyExtractor={(item, index) => `${item.id ?? index}`}
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.kicker}>SKY EVENTS</Text>
              <Text style={styles.title}>Upcoming Sky Events</Text>
              <Text style={styles.subtitle}>Track eclipses, meteor showers, and planetary alignments.</Text>
              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <View style={styles.badgeRow}>
                  <Badge label="NEXT 60 DAYS" />
                  <Text style={styles.badgeHelper}>Sorted by soonest event</Text>
                </View>
              </GlassCard>
            </View>
          )}
          renderItem={({ item }) => (
            <GlassCard variant="secondary" style={styles.card}>
              <View style={styles.glowStrip} />
              <Text style={styles.cardTitle}>{item.title || 'Untitled Event'}</Text>
              <Text style={styles.cardMeta}>{item.start ? item.start.slice(0, 10) : 'Date TBD'}</Text>
              {item.type ? <Text style={styles.cardMeta}>{item.type}</Text> : null}
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
  card: { marginBottom: 12 },
  glowStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255,79,216,0.35)',
  },
  cardTitle: { ...typography.h2, color: colors.text },
  cardMeta: { ...typography.small, color: colors.muted, marginTop: 6 },
})
