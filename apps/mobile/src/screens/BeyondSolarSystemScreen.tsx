import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, StyleSheet, View, ScrollView, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { getExoplanets, getDiscoveryStats, getHabitableCandidates, getDiscoveryMethods, getStarTypes } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

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
          <CustomText variant="sectionLabel" style={styles.kicker}>BEYOND OUR SOLAR SYSTEM</CustomText>
          <CustomText variant="hero" style={styles.title}>Exoplanet Discovery Console</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Confirmed planets orbiting distant stars.</CustomText>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Discovery Stats</CustomText>
              <View style={styles.statsRow}>
                <View>
                  <CustomText variant="cardTitle" style={styles.statValue}>{stats.totalConfirmed}</CustomText>
                  <CustomText variant="bodySmall" style={styles.statLabel}>Confirmed</CustomText>
                </View>
                <View>
                  <CustomText variant="cardTitle" style={styles.statValue}>{stats.earthSizedCount}</CustomText>
                  <CustomText variant="bodySmall" style={styles.statLabel}>Earth-sized</CustomText>
                </View>
                <View>
                  <CustomText variant="cardTitle" style={styles.statValue}>{stats.closestWorld?.name || '—'}</CustomText>
                  <CustomText variant="bodySmall" style={styles.statLabel}>Closest</CustomText>
                </View>
              </View>
            </GlassCard>

            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Habitable Candidates</CustomText>
              {habitable.length ? (
                habitable.slice(0, 4).map((planet) => (
                  <CustomText key={planet.name} variant="body" style={styles.listItem}>• {planet.name} • {planet.distanceLightYears} ly</CustomText>
                ))
              ) : (
                <CustomText variant="body" style={styles.muted}>No candidates in range yet.</CustomText>
              )}
            </GlassCard>

            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Filters</CustomText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                <View style={styles.filterRow}>
                  <Pressable style={styles.filterChip} onPress={() => setMethod('')}>
                    <CustomText variant="sectionLabel" style={styles.filterText}>All Methods</CustomText>
                  </Pressable>
                  {methods.map((m) => (
                    <Pressable key={m} style={styles.filterChip} onPress={() => setMethod(m)}>
                      <CustomText variant="sectionLabel" style={styles.filterText}>{m}</CustomText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
                <View style={styles.filterRow}>
                  <Pressable style={styles.filterChip} onPress={() => setStarType('')}>
                    <CustomText variant="sectionLabel" style={styles.filterText}>All Star Types</CustomText>
                  </Pressable>
                  {starTypes.map((t) => (
                    <Pressable key={t} style={styles.filterChip} onPress={() => setStarType(t)}>
                      <CustomText variant="sectionLabel" style={styles.filterText}>{t}</CustomText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </GlassCard>

            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Confirmed Worlds</CustomText>
              {filtered.slice(0, 8).map((planet) => (
                <View key={planet.name} style={styles.planetRow}>
                  <CustomText variant="cardTitle" style={styles.planetName}>{planet.name}</CustomText>
                  <CustomText variant="bodySmall" style={styles.planetMeta}>
                    {planet.discoveryMethod} • {planet.distanceLightYears} ly
                  </CustomText>
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
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  sectionTitle: { color: colors.dim, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statValue: { color: colors.text },
  statLabel: { color: colors.muted },
  listItem: { color: colors.muted, marginTop: 6 },
  muted: { color: colors.muted },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  filterText: { color: colors.text },
  planetRow: { marginTop: spacing.sm },
  planetName: { color: colors.text },
  planetMeta: { color: colors.muted },
})
