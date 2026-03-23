import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, ScrollView, TextInput, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { getActiveRockets, filterRockets, sortRockets, getUniqueManufacturers, ROUTE_MANIFEST } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

export default function RocketsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [rockets, setRockets] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [manufacturer, setManufacturer] = useState<string | null>(null)
  const [reusable, setReusable] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'thrust' | 'payload' | 'launches'>('name')
  const manufacturers = getUniqueManufacturers(rockets)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { rockets } = await getActiveRockets()
        if (active) setRockets(rockets || [])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filtered = sortRockets(
    filterRockets(rockets, { search, manufacturer, reusable }),
    sortBy
  )

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>ROCKET SCIENCE</CustomText>
          <CustomText variant="hero" style={styles.title}>Launch Vehicles</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Search active vehicles and specifications.</CustomText>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search rockets..."
            placeholderTextColor="rgba(234,242,255,0.4)"
          />

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Filters</CustomText>
            <View style={styles.filterRow}>
              <CustomText variant="sectionLabel" style={styles.filterLabel}>Manufacturer</CustomText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {['All', ...manufacturers].map((name) => {
                    const isActive = (name === 'All' && !manufacturer) || name === manufacturer
                    return (
                      <Pressable
                        key={name}
                        onPress={() => setManufacturer(name === 'All' ? null : name)}
                        style={[styles.chip, isActive && styles.chipActive]}
                      >
                        <CustomText variant="sectionLabel" style={[styles.chipText, isActive && styles.chipTextActive]}>{name}</CustomText>
                      </Pressable>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.filterRow, { marginTop: spacing.sm }]}>
              <CustomText variant="sectionLabel" style={styles.filterLabel}>Reusable</CustomText>
              <View style={styles.chipRow}>
                {[
                  { label: 'All', value: null },
                  { label: 'Reusable', value: true },
                  { label: 'Expendable', value: false },
                ].map((option) => {
                  const isActive = reusable === option.value
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => setReusable(option.value)}
                      style={[styles.chip, isActive && styles.chipActive]}
                    >
                      <CustomText variant="sectionLabel" style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</CustomText>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={[styles.filterRow, { marginTop: spacing.sm }]}>
              <CustomText variant="sectionLabel" style={styles.filterLabel}>Sort</CustomText>
              <View style={styles.chipRow}>
                {[
                  { label: 'Name', value: 'name' },
                  { label: 'Thrust', value: 'thrust' },
                  { label: 'Payload', value: 'payload' },
                  { label: 'Launches', value: 'launches' },
                ].map((option) => {
                  const isActive = sortBy === option.value
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSortBy(option.value as any)}
                      style={[styles.chip, isActive && styles.chipActive]}
                    >
                      <CustomText variant="sectionLabel" style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</CustomText>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Spacecraft Hub</CustomText>
            <CustomText variant="body" style={styles.body}>Browse crew and cargo spacecraft.</CustomText>
            <Pressable onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.SPACECRAFT_HUB)}>
              <CustomText variant="sectionLabel" style={styles.cta}>Open Spacecraft Hub →</CustomText>
            </Pressable>
          </GlassCard>

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.body}>Loading vehicle database…</CustomText>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.body}>No vehicles match this filter.</CustomText>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {filtered.map((rocket) => (
                <Pressable
                  key={rocket.id || rocket.name}
                  onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.ROCKET_DETAIL, { rocketId: rocket.id })}
                >
                  <GlassCard variant="secondary">
                    <CustomText variant="cardTitle" style={styles.rocketTitle}>{rocket.name || 'Launch Vehicle'}</CustomText>
                    <CustomText variant="bodySmall" style={styles.meta}>{rocket.manufacturerName || 'Unknown Manufacturer'}</CustomText>
                    {rocket.description ? (
                      <CustomText variant="body" style={styles.body} numberOfLines={2}>{rocket.description}</CustomText>
                    ) : null}
                  </GlassCard>
                </Pressable>
              ))}
            </View>
          )}
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
  input: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.3)',
    borderRadius: 12,
    padding: 10,
    color: colors.text,
  },
  filterRow: {
    marginTop: spacing.sm,
  },
  filterLabel: { color: colors.dim, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    backgroundColor: 'rgba(9, 14, 26, 0.4)',
  },
  chipActive: {
    borderColor: 'rgba(61,235,255,0.9)',
    backgroundColor: 'rgba(61,235,255,0.18)',
  },
  chipText: { color: colors.dim },
  chipTextActive: { color: colors.text },
  sectionTitle: { color: colors.dim, marginBottom: 6 },
  rocketTitle: { color: colors.text },
  meta: { color: colors.dim, marginTop: 6 },
  body: { color: colors.muted, marginTop: 6 },
  cta: { color: colors.accent, marginTop: spacing.sm },
})
