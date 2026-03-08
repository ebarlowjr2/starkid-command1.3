import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { PLANETS } from '../data/planets'

const statusColors: Record<string, string> = {
  live: 'rgba(34,197,94,0.2)',
  locked: 'rgba(148,163,184,0.2)',
  coming_soon: 'rgba(250,204,21,0.2)',
}

export default function PlanetsScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>VISIT ANOTHER PLANET</Text>
          <Text style={styles.title}>Planetary Command Centers</Text>
          <Text style={styles.subtitle}>Select a destination to explore planetary systems.</Text>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {PLANETS.map((planet) => (
              <GlassCard key={planet.id} variant="secondary">
                <View style={styles.cardHeader}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={[styles.statusBadge, { backgroundColor: statusColors[planet.status] || 'rgba(61,235,255,0.15)' }]}>
                    {planet.status.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.tagline}>{planet.tagline}</Text>
                <Text style={styles.description}>{planet.description}</Text>
              </GlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planetName: { ...typography.h2, color: colors.text },
  statusBadge: {
    ...typography.pixel,
    color: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagline: { ...typography.small, color: colors.muted, marginTop: 6 },
  description: { ...typography.body, color: colors.muted, marginTop: 6 },
})
