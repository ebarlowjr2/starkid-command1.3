import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Image, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing } from '../theme/tokens'
import { getPhotoOfDay, extractTelemetry, MARS_FACTS } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

export default function PlanetDetailScreen({ route, navigation }: any) {
  const planetId = route?.params?.planetId
  const [photo, setPhoto] = useState<any | null>(null)
  const [telemetry, setTelemetry] = useState<any | null>(null)
  const [weather, setWeather] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      if (planetId !== 'mars') return
      setLoading(true)
      setError(null)
      try {
        let photoOfDay = await getPhotoOfDay('curiosity')
        if (!photoOfDay) {
          photoOfDay = await getPhotoOfDay('perseverance')
        }
        if (!active) return
        if (!photoOfDay) {
          setError('No rover photos available')
        } else {
          setPhoto(photoOfDay)
          setTelemetry(extractTelemetry(photoOfDay))
        }
        setWeather({
          available: false,
          source: 'official',
          message:
            'Live surface weather is not officially provided via a stable NASA public endpoint. InSight lander was retired in December 2022.',
        })
      } catch (err: any) {
        if (!active) return
        setError(err?.message || 'Failed to load Mars data')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [planetId, refreshKey])

  if (planetId !== 'mars') {
    return (
      <SpaceBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <CustomText variant="sectionLabel" style={styles.kicker}>PLANETARY COMMAND</CustomText>
            <CustomText variant="hero" style={styles.title}>Destination Offline</CustomText>
            <CustomText variant="body" style={styles.subtitle}>This command center is coming soon.</CustomText>
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
          <CustomText variant="sectionLabel" style={styles.kicker}>MARS COMMAND CENTER</CustomText>
          <CustomText variant="hero" style={styles.title}>Rover Ops • Telemetry Active</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Daily rover capture and surface telemetry.</CustomText>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, loading ? styles.statusLoading : error ? styles.statusError : styles.statusOk]} />
            <CustomText variant="sectionLabel" style={styles.statusText}>
              {loading ? 'SYNCING' : error ? 'ERROR' : 'CONNECTED'}
            </CustomText>
            <Pressable onPress={() => setRefreshKey((v) => v + 1)}>
              <CustomText variant="sectionLabel" style={styles.refresh}>REFRESH →</CustomText>
            </Pressable>
          </View>

          {error ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="bodySmall" style={styles.error}>{error}</CustomText>
            </GlassCard>
          ) : null}

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Photo of the Sol</CustomText>
            {photo?.img_src ? (
              <Image source={{ uri: photo.img_src }} style={styles.photo} resizeMode="cover" />
            ) : (
              <CustomText variant="body" style={styles.body}>{loading ? 'Loading rover imagery…' : 'No imagery available.'}</CustomText>
            )}
            {telemetry ? (
              <View style={{ marginTop: spacing.sm }}>
                <CustomText variant="bodySmall" style={styles.meta}>Camera: {telemetry.cameraFullName}</CustomText>
                <CustomText variant="bodySmall" style={styles.meta}>Sol: {telemetry.currentSol}</CustomText>
                <CustomText variant="bodySmall" style={styles.meta}>Earth Date: {telemetry.earthDate}</CustomText>
              </View>
            ) : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Telemetry</CustomText>
            {telemetry ? (
              <>
                <CustomText variant="body" style={styles.body}>Rover: {telemetry.roverName}</CustomText>
                <CustomText variant="body" style={styles.body}>Status: {telemetry.roverStatus}</CustomText>
                <CustomText variant="body" style={styles.body}>Max Sol: {telemetry.maxSol}</CustomText>
                <CustomText variant="body" style={styles.body}>Total Photos: {telemetry.totalPhotos}</CustomText>
              </>
            ) : (
              <CustomText variant="body" style={styles.body}>{loading ? 'Telemetry loading…' : 'Telemetry unavailable.'}</CustomText>
            )}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Surface Weather</CustomText>
            <CustomText variant="body" style={styles.body}>{weather?.message || 'Weather status unavailable.'}</CustomText>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.panelTitle}>Mars Facts</CustomText>
            {MARS_FACTS.slice(0, 6).map((fact) => (
              <CustomText key={fact.id} variant="body" style={styles.body}>
                {fact.label.replace('_', ' ')}: {fact.value}
              </CustomText>
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
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLoading: { backgroundColor: '#facc15' },
  statusError: { backgroundColor: '#f87171' },
  statusOk: { backgroundColor: '#4ade80' },
  statusText: { color: colors.dim },
  refresh: { color: colors.accent, marginLeft: 'auto' },
  panelTitle: { color: colors.dim, marginBottom: spacing.sm },
  body: { color: colors.muted, marginTop: 4 },
  meta: { color: colors.dim, marginTop: 4 },
  photo: { width: '100%', height: 180, borderRadius: 14, marginTop: spacing.sm },
  error: { color: '#f87171' },
})
