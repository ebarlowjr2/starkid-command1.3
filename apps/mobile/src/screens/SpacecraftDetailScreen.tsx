import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, Image } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing, typography } from '../theme/tokens'
import { getSpacecraftById } from '@starkid/core'

export default function SpacecraftDetailScreen({ route, navigation }: any) {
  const spacecraftId = route?.params?.spacecraftId
  const [craft, setCraft] = useState<any | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { spacecraft } = await getSpacecraftById(String(spacecraftId))
        if (active) setCraft(spacecraft)
      } catch (error) {
        if (active) setCraft(null)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [spacecraftId])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>SPACECRAFT DETAIL</Text>
          <Text style={styles.title}>{craft?.name || 'Spacecraft'}</Text>
          <Text style={styles.subtitle}>{craft?.agencyName || craft?.typeName || 'Vehicle'}</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            {craft?.imageUrl ? <Image source={{ uri: craft.imageUrl }} style={styles.image} /> : null}
            {craft?.description ? <Text style={styles.body}>{craft.description}</Text> : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.panelTitle}>Capabilities</Text>
            <Text style={styles.body}>Type: {craft?.typeName || 'N/A'}</Text>
            <Text style={styles.body}>Human Rated: {craft?.humanRated ? 'Yes' : 'No'}</Text>
            <Text style={styles.body}>Crew Capacity: {craft?.crewCapacity ?? 'N/A'}</Text>
            <Text style={styles.body}>Maiden Flight: {craft?.maidenFlight || 'N/A'}</Text>
          </GlassCard>

          <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg, alignSelf: 'center' }} />
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
  panelTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.muted, marginTop: 4 },
  image: { width: '100%', height: 180, borderRadius: 14, marginBottom: spacing.sm },
})
