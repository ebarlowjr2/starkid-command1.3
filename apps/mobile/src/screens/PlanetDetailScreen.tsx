import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing, typography } from '../theme/tokens'
import { getPhotoOfDay, extractTelemetry, MARS_FACTS } from '@starkid/core'

export default function PlanetDetailScreen({ route, navigation }: any) {
  const planetId = route?.params?.planetId
  const [photo, setPhoto] = useState<any | null>(null)
  const [telemetry, setTelemetry] = useState<any | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      if (planetId !== 'mars') return
      const photoOfDay = await getPhotoOfDay('curiosity')
      if (!active) return
      setPhoto(photoOfDay)
      setTelemetry(extractTelemetry(photoOfDay))
    }
    load()
    return () => {
      active = false
    }
  }, [planetId])

  if (planetId !== 'mars') {
    return (
      <SpaceBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>PLANETARY COMMAND</Text>
            <Text style={styles.title}>Destination Offline</Text>
            <Text style={styles.subtitle}>This command center is coming soon.</Text>
            <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
          </ScrollView>
        </SafeAreaView>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>MARS COMMAND CENTER</Text>
          <Text style={styles.title}>Rover Ops • Telemetry Active</Text>
          <Text style={styles.subtitle}>Daily rover capture and surface telemetry.</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.panelTitle}>Photo of the Sol</Text>
            {photo?.img_src ? (
              <Image source={{ uri: photo.img_src }} style={styles.photo} resizeMode="cover" />
            ) : (
              <Text style={styles.body}>Loading rover imagery…</Text>
            )}
            {telemetry ? (
              <View style={{ marginTop: spacing.sm }}>
                <Text style={styles.meta}>Camera: {telemetry.cameraFullName}</Text>
                <Text style={styles.meta}>Sol: {telemetry.currentSol}</Text>
                <Text style={styles.meta}>Earth Date: {telemetry.earthDate}</Text>
              </View>
            ) : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.panelTitle}>Telemetry</Text>
            {telemetry ? (
              <>
                <Text style={styles.body}>Rover: {telemetry.roverName}</Text>
                <Text style={styles.body}>Status: {telemetry.roverStatus}</Text>
                <Text style={styles.body}>Max Sol: {telemetry.maxSol}</Text>
                <Text style={styles.body}>Total Photos: {telemetry.totalPhotos}</Text>
              </>
            ) : (
              <Text style={styles.body}>Telemetry loading…</Text>
            )}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.panelTitle}>Mars Facts</Text>
            {MARS_FACTS.slice(0, 6).map((fact) => (
              <Text key={fact.id} style={styles.body}>
                {fact.label.replace('_', ' ')}: {fact.value}
              </Text>
            ))}
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
  meta: { ...typography.small, color: colors.dim, marginTop: 4 },
  photo: { width: '100%', height: 180, borderRadius: 14, marginTop: spacing.sm },
})
