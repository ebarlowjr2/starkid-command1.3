import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { getUpcomingSkyEventsService } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

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
          <CustomText variant="body" style={styles.muted}>Loading sky events…</CustomText>
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
              <CustomText variant="sectionLabel" style={styles.kicker}>SKY EVENTS</CustomText>
              <CustomText variant="hero" style={styles.title}>Upcoming Sky Events</CustomText>
              <CustomText variant="body" style={styles.subtitle}>Track eclipses, meteor showers, and planetary alignments.</CustomText>
              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <View style={styles.badgeRow}>
                  <Badge label="NEXT 60 DAYS" />
                  <CustomText variant="sectionLabel" style={styles.badgeHelper}>Sorted by soonest event</CustomText>
                </View>
              </GlassCard>
            </View>
          )}
          renderItem={({ item }) => (
            <GlassCard variant="secondary" style={styles.card}>
              <View style={styles.glowStrip} />
              <CustomText variant="cardTitle" style={styles.cardTitle}>{item.title || 'Untitled Event'}</CustomText>
              <CustomText variant="bodySmall" style={styles.cardMeta}>{item.start ? item.start.slice(0, 10) : 'Date TBD'}</CustomText>
              {item.type ? <CustomText variant="bodySmall" style={styles.cardMeta}>{item.type}</CustomText> : null}
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
  card: { marginBottom: 12 },
  glowStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255,79,216,0.35)',
  },
  cardTitle: { color: colors.text },
  cardMeta: { color: colors.muted, marginTop: 6 },
})
