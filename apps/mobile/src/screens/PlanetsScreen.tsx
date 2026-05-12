import React from 'react'
import { SafeAreaView, StyleSheet, View, ScrollView, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { PLANETS } from '../data/planets'
import { ROUTE_MANIFEST } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

const statusColors: Record<string, string> = {
  live: 'rgba(34,197,94,0.2)',
  locked: 'rgba(148,163,184,0.2)',
  coming_soon: 'rgba(250,204,21,0.2)',
}

export default function PlanetsScreen({ navigation }: any) {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>VISIT ANOTHER PLANET</CustomText>
          <CustomText variant="hero" style={styles.title}>Planetary Command Centers</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Select a destination to explore planetary systems.</CustomText>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {PLANETS.map((planet) => {
              const card = (
                <GlassCard key={planet.id} variant="secondary">
                  <View style={styles.cardHeader}>
                    <CustomText variant="cardTitle" style={styles.planetName}>{planet.name}</CustomText>
                    <CustomText variant="sectionLabel" style={[styles.statusBadge, { backgroundColor: statusColors[planet.status] || 'rgba(61,235,255,0.15)' }]}>
                      {planet.status.replace('_', ' ')}
                    </CustomText>
                  </View>
                  <CustomText variant="bodySmall" style={styles.tagline}>{planet.tagline}</CustomText>
                  <CustomText variant="body" style={styles.description}>{planet.description}</CustomText>
                  {planet.status === 'live' ? (
                    <CustomText variant="sectionLabel" style={styles.cta}>Open Command Center →</CustomText>
                  ) : null}
                </GlassCard>
              )

              if (planet.status !== 'live') return card

              return (
                <Pressable
                  key={planet.id}
                  onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.PLANET_DETAIL, { planetId: planet.id })}
                >
                  {card}
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planetName: { color: colors.text },
  statusBadge: {
    color: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagline: { color: colors.muted, marginTop: 6 },
  description: { color: colors.muted, marginTop: 6 },
  cta: { color: colors.accent, marginTop: spacing.sm },
})
