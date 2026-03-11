import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TextInput, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { getActiveRockets, filterRockets, sortRockets, ROUTE_MANIFEST } from '@starkid/core'

export default function RocketsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [rockets, setRockets] = useState<any[]>([])
  const [search, setSearch] = useState('')

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
    filterRockets(rockets, { search }),
    'name'
  )

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>ROCKET SCIENCE</Text>
          <Text style={styles.title}>Launch Vehicles</Text>
          <Text style={styles.subtitle}>Search active vehicles and specifications.</Text>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search rockets..."
            placeholderTextColor="rgba(234,242,255,0.4)"
          />

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Spacecraft Hub</Text>
            <Text style={styles.body}>Browse crew and cargo spacecraft.</Text>
            <Pressable onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.SPACECRAFT_HUB)}>
              <Text style={styles.cta}>Open Spacecraft Hub →</Text>
            </Pressable>
          </GlassCard>

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>Loading vehicle database…</Text>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>No vehicles match this filter.</Text>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {filtered.map((rocket) => (
                <Pressable
                  key={rocket.id || rocket.name}
                  onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.ROCKET_DETAIL, { rocketId: rocket.id })}
                >
                  <GlassCard variant="secondary">
                    <Text style={styles.rocketTitle}>{rocket.name || 'Launch Vehicle'}</Text>
                    <Text style={styles.meta}>{rocket.manufacturerName || 'Unknown Manufacturer'}</Text>
                    {rocket.description ? (
                      <Text style={styles.body} numberOfLines={2}>{rocket.description}</Text>
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
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  input: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.3)',
    borderRadius: 12,
    padding: 10,
    color: colors.text,
  },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  rocketTitle: { ...typography.h2, color: colors.text },
  meta: { ...typography.small, color: colors.dim, marginTop: 6 },
  body: { ...typography.body, color: colors.muted, marginTop: 6 },
  cta: { ...typography.pixel, color: colors.accent, marginTop: spacing.sm },
})
