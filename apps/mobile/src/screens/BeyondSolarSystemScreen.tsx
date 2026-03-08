import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { getExoplanets, getDiscoveryStats, getHabitableCandidates, getDiscoveryMethods, getStarTypes } from '@starkid/core'

export default function BeyondSolarSystemScreen() {
  const [planets, setPlanets] = useState<any[]>([])
  const [method, setMethod] = useState('')
  const [starType, setStarType] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getExoplanets()
      if (active) setPlanets(data || [])
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const methods = useMemo(() => getDiscoveryMethods(planets), [planets])
  const starTypes = useMemo(() => getStarTypes(planets), [planets])
  const stats = useMemo(() => getDiscoveryStats(planets), [planets])
  const habitable = useMemo(() => getHabitableCandidates(planets), [planets])

  const filtered = useMemo(() => {
    return planets.filter((planet) => {
      if (method && planet.discoveryMethod !== method) return false
      if (starType && planet.starType !== starType) return false
      return true
    })
  }, [planets, method, starType])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>BEYOND OUR SOLAR SYSTEM</Text>
          <Text style={styles.title}>Exoplanet Discovery Console</Text>
          <Text style={styles.subtitle}>Confirmed planets orbiting distant stars.</Text>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Discovery Stats</Text>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statValue}>{stats.totalConfirmed}</Text>
                  <Text style={styles.statLabel}>Confirmed</Text>
                </View>
                <View>
                  <Text style={styles.statValue}>{stats.earthSizedCount}</Text>
                  <Text style={styles.statLabel}>Earth-sized</Text>
                </View>
                <View>
                  <Text style={styles.statValue}>{stats.closestWorld?.name || '—'}</Text>
                  <Text style={styles.statLabel}>Closest</Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Habitable Candidates</Text>
              {habitable.length ? (
                habitable.slice(0, 4).map((planet) => (
                  <Text key={planet.name} style={styles.listItem}>• {planet.name} • {planet.distanceLightYears} ly</Text>
                ))
              ) : (
                <Text style={styles.muted}>No candidates in range yet.</Text>
              )}
            </GlassCard>

            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Filters</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                <View style={styles.filterRow}>
                  <Pressable style={styles.filterChip} onPress={() => setMethod('')}>
                    <Text style={styles.filterText}>All Methods</Text>
                  </Pressable>
                  {methods.map((m) => (
                    <Pressable key={m} style={styles.filterChip} onPress={() => setMethod(m)}>
                      <Text style={styles.filterText}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                <View style={styles.filterRow}>
                  <Pressable style={styles.filterChip} onPress={() => setStarType('')}>
                    <Text style={styles.filterText}>All Star Types</Text>
                  </Pressable>
                  {starTypes.map((t) => (
                    <Pressable key={t} style={styles.filterChip} onPress={() => setStarType(t)}>
                      <Text style={styles.filterText}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </GlassCard>

            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Confirmed Worlds</Text>
              {filtered.slice(0, 8).map((planet) => (
                <View key={planet.name} style={styles.planetRow}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={styles.planetMeta}>
                    {planet.discoveryMethod} • {planet.distanceLightYears} ly
                  </Text>
                </View>
              ))}
            </GlassCard>
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
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.small, color: colors.muted },
  listItem: { ...typography.body, color: colors.muted, marginTop: 6 },
  muted: { ...typography.body, color: colors.muted },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  filterText: { ...typography.pixel, color: colors.text },
  planetRow: { marginTop: spacing.sm },
  planetName: { ...typography.h2, color: colors.text },
  planetMeta: { ...typography.small, color: colors.muted },
})
