import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Image } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing } from '../theme/tokens'
import { getSpacecraftById } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

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
          <CustomText variant="sectionLabel" style={styles.kicker}>SPACECRAFT DETAIL</CustomText>
          <CustomText variant="hero" style={styles.title}>{craft?.name || 'Spacecraft'}</CustomText>
          <CustomText variant="body" style={styles.subtitle}>{craft?.agencyName || craft?.typeName || 'Vehicle'}</CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            {craft?.imageUrl ? <Image source={{ uri: craft.imageUrl }} style={styles.image} /> : null}
            {craft?.description ? <CustomText variant="body" style={styles.body}>{craft.description}</CustomText> : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Capabilities</CustomText>
            <CustomText variant="body" style={styles.body}>Type: {craft?.typeName || 'N/A'}</CustomText>
            <CustomText variant="body" style={styles.body}>Human Rated: {craft?.humanRated ? 'Yes' : 'No'}</CustomText>
            <CustomText variant="body" style={styles.body}>Crew Capacity: {craft?.crewCapacity ?? 'N/A'}</CustomText>
            <CustomText variant="body" style={styles.body}>Maiden Flight: {craft?.maidenFlight || 'N/A'}</CustomText>
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
