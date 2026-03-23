import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Image } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing } from '../theme/tokens'
import { getRocketById, formatThrust, formatPayload, formatLength, formatMass } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

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
          <CustomText variant="sectionLabel" style={styles.kicker}>ROCKET DETAIL</CustomText>
          <CustomText variant="hero" style={styles.title}>{rocket?.name || 'Launch Vehicle'}</CustomText>
          <CustomText variant="body" style={styles.subtitle}>{rocket?.manufacturerName || rocket?.countryName || 'Launch Provider'}</CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            {rocket?.imageUrl ? <Image source={{ uri: rocket.imageUrl }} style={styles.image} /> : null}
            {rocket?.description ? <CustomText variant="body" style={styles.body}>{rocket.description}</CustomText> : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Performance</CustomText>
            <CustomText variant="body" style={styles.body}>LEO: {formatPayload(rocket?.leoCapacityKg)}</CustomText>
            <CustomText variant="body" style={styles.body}>GTO: {formatPayload(rocket?.gtoCapacityKg)}</CustomText>
            <CustomText variant="body" style={styles.body}>Thrust: {formatThrust(rocket?.toThrustKN)}</CustomText>
            <CustomText variant="body" style={styles.body}>Length: {formatLength(rocket?.lengthM)}</CustomText>
            <CustomText variant="body" style={styles.body}>Mass: {formatMass(rocket?.launchMassT)}</CustomText>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Launch Stats</CustomText>
            <CustomText variant="body" style={styles.body}>Total Launches: {rocket?.totalLaunches ?? 'N/A'}</CustomText>
            <CustomText variant="body" style={styles.body}>Successful: {rocket?.successfulLaunches ?? 'N/A'}</CustomText>
            <CustomText variant="body" style={styles.body}>Failed: {rocket?.failedLaunches ?? 'N/A'}</CustomText>
          </GlassCard>

          <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg, alignSelf: 'center' }} />
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
  panelTitle: { color: colors.dim, marginBottom: spacing.sm },
  body: { color: colors.muted, marginTop: 4 },
  image: { width: '100%', height: 180, borderRadius: 14, marginBottom: spacing.sm },
})
