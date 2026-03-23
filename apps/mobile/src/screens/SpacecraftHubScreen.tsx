import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, TextInput, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { getActiveSpacecraft, filterSpacecraft, sortSpacecraft, getUniqueTypes, ROUTE_MANIFEST } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

export default function SpacecraftHubScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [spacecraft, setSpacecraft] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | null>(null)
  const [humanRated, setHumanRated] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'agency' | 'type'>('name')
  const types = getUniqueTypes(spacecraft)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { spacecraft } = await getActiveSpacecraft()
        if (active) setSpacecraft(spacecraft || [])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const filtered = sortSpacecraft(
    filterSpacecraft(spacecraft, { search, type, humanRated }),
    sortBy
  )

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>SPACECRAFT HUB</CustomText>
          <CustomText variant="hero" style={styles.title}>Crew + Cargo Vehicles</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Search active spacecraft and capabilities.</CustomText>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search spacecraft..."
            placeholderTextColor="rgba(234,242,255,0.4)"
          />

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Filters</CustomText>
            <View style={styles.filterRow}>
              <CustomText variant="sectionLabel" style={styles.filterLabel}>Type</CustomText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {['All', ...types].map((name) => {
                    const isActive = (name === 'All' && !type) || name === type
                    return (
                      <Pressable
                        key={name}
                        onPress={() => setType(name === 'All' ? null : name)}
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
              <CustomText variant="sectionLabel" style={styles.filterLabel}>Human Rated</CustomText>
              <View style={styles.chipRow}>
                {[
                  { label: 'All', value: null },
                  { label: 'Human Rated', value: true },
                  { label: 'Cargo Only', value: false },
                ].map((option) => {
                  const isActive = humanRated === option.value
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => setHumanRated(option.value)}
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
                  { label: 'Agency', value: 'agency' },
                  { label: 'Type', value: 'type' },
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

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.body}>Loading spacecraft database…</CustomText>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.body}>No spacecraft match this filter.</CustomText>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {filtered.map((craft) => (
                <Pressable
                  key={craft.id}
                  onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.SPACECRAFT_DETAIL, { spacecraftId: craft.id })}
                >
                  <GlassCard variant="secondary">
                    <CustomText variant="cardTitle" style={styles.itemTitle}>{craft.name}</CustomText>
                    <CustomText variant="bodySmall" style={styles.meta}>{craft.agencyName} • {craft.typeName}</CustomText>
                    {craft.description ? (
                      <CustomText variant="body" style={styles.body} numberOfLines={2}>{craft.description}</CustomText>
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
  itemTitle: { color: colors.text },
  meta: { color: colors.dim, marginTop: 4 },
  body: { color: colors.muted, marginTop: 6 },
})
