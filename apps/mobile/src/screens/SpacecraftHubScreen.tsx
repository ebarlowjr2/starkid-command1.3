import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { getActiveSpacecraft, filterSpacecraft, sortSpacecraft, ROUTE_MANIFEST } from '@starkid/core'

export default function SpacecraftHubScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [spacecraft, setSpacecraft] = useState<any[]>([])
  const [search, setSearch] = useState('')

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
    filterSpacecraft(spacecraft, { search }),
    'name'
  )

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>SPACECRAFT HUB</Text>
          <Text style={styles.title}>Crew + Cargo Vehicles</Text>
          <Text style={styles.subtitle}>Search active spacecraft and capabilities.</Text>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search spacecraft..."
            placeholderTextColor="rgba(234,242,255,0.4)"
          />

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>Loading spacecraft database…</Text>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>No spacecraft match this filter.</Text>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {filtered.map((craft) => (
                <Pressable
                  key={craft.id}
                  onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.SPACECRAFT_DETAIL, { spacecraftId: craft.id })}
                >
                  <GlassCard variant="secondary">
                    <Text style={styles.itemTitle}>{craft.name}</Text>
                    <Text style={styles.meta}>{craft.agencyName} • {craft.typeName}</Text>
                    {craft.description ? (
                      <Text style={styles.body} numberOfLines={2}>{craft.description}</Text>
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
  itemTitle: { ...typography.h2, color: colors.text },
  meta: { ...typography.small, color: colors.dim, marginTop: 4 },
  body: { ...typography.body, color: colors.muted, marginTop: 6 },
})
