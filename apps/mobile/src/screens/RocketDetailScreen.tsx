import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing, typography } from '../theme/tokens'
import { getRocketById, formatThrust, formatPayload, formatLength, formatMass } from '@starkid/core'

export default function RocketDetailScreen({ route, navigation }: any) {
  const rocketId = route?.params?.rocketId
  const [rocket, setRocket] = useState<any | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { rocket } = await getRocketById(String(rocketId))
        if (active) setRocket(rocket)
      } catch (error) {
        if (active) setRocket(null)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [rocketId])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>ROCKET DETAIL</Text>
          <Text style={styles.title}>{rocket?.name || 'Launch Vehicle'}</Text>
          <Text style={styles.subtitle}>{rocket?.manufacturerName || rocket?.countryName || 'Launch Provider'}</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            {rocket?.imageUrl ? <Image source={{ uri: rocket.imageUrl }} style={styles.image} /> : null}
            {rocket?.description ? <Text style={styles.body}>{rocket.description}</Text> : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.panelTitle}>Performance</Text>
            <Text style={styles.body}>LEO: {formatPayload(rocket?.leoCapacityKg)}</Text>
            <Text style={styles.body}>GTO: {formatPayload(rocket?.gtoCapacityKg)}</Text>
            <Text style={styles.body}>Thrust: {formatThrust(rocket?.toThrustKN)}</Text>
            <Text style={styles.body}>Length: {formatLength(rocket?.lengthM)}</Text>
            <Text style={styles.body}>Mass: {formatMass(rocket?.launchMassT)}</Text>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.panelTitle}>Launch Stats</Text>
            <Text style={styles.body}>Total Launches: {rocket?.totalLaunches ?? 'N/A'}</Text>
            <Text style={styles.body}>Successful: {rocket?.successfulLaunches ?? 'N/A'}</Text>
            <Text style={styles.body}>Failed: {rocket?.failedLaunches ?? 'N/A'}</Text>
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
