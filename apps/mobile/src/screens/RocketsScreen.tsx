import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { getRocketsService } from '@starkid/core'

export default function RocketsScreen() {
  const [loading, setLoading] = useState(true)
  const [rockets, setRockets] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data } = await getRocketsService()
        if (active) setRockets(data || [])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>ROCKET SCIENCE</Text>
          <Text style={styles.title}>Launch Vehicles</Text>
          <Text style={styles.subtitle}>Active rockets and performance highlights.</Text>

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>Loading vehicle database…</Text>
            </GlassCard>
          ) : rockets.length === 0 ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>No vehicles available.</Text>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {rockets.map((rocket) => (
                <GlassCard key={rocket.id || rocket.name} variant="secondary">
                  <Text style={styles.rocketTitle}>{rocket.name || 'Launch Vehicle'}</Text>
                  <Text style={styles.meta}>{rocket.country || rocket.company || 'Unknown Manufacturer'}</Text>
                  {rocket.description ? (
                    <Text style={styles.body} numberOfLines={2}>{rocket.description}</Text>
                  ) : null}
                </GlassCard>
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
  rocketTitle: { ...typography.h2, color: colors.text },
  meta: { ...typography.small, color: colors.dim, marginTop: 6 },
  body: { ...typography.body, color: colors.muted, marginTop: 6 },
})
