import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, ScrollView } from 'react-native'
import { getSolarActivity, getAsteroidFlybys, getLatestLaunch, getUpcomingLaunchesWindow, getProviderSpotlights, ROUTE_MANIFEST } from '@starkid/core'
import { useNavigation } from '@react-navigation/native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing, typography } from '../theme/tokens'

export default function CommandCenterScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [solar, setSolar] = useState<any | null>(null)
  const [neos, setNeos] = useState<any[]>([])
  const [latestLaunch, setLatestLaunch] = useState<any | null>(null)
  const [upcomingLaunches, setUpcomingLaunches] = useState<any[]>([])
  const [providerSpotlights, setProviderSpotlights] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [solarResult, neosResult, latestResult, upcomingResult, providerResult] = await Promise.allSettled([
          getSolarActivity({ days: 3 }),
          getAsteroidFlybys(),
          getLatestLaunch(),
          getUpcomingLaunchesWindow({ days: 7, limit: 7 }),
          getProviderSpotlights(),
        ])
        if (active) {
          setSolar(solarResult.status === 'fulfilled' ? solarResult.value?.data : null)
          setNeos(neosResult.status === 'fulfilled' ? neosResult.value?.data || [] : [])
          setLatestLaunch(latestResult.status === 'fulfilled' ? latestResult.value?.data : null)
          setUpcomingLaunches(upcomingResult.status === 'fulfilled' ? upcomingResult.value?.data || [] : [])
          setProviderSpotlights(providerResult.status === 'fulfilled' ? providerResult.value?.data || [] : [])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading mission alerts…</Text>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>COMMAND CENTER</Text>
            <Text style={styles.title}>Mission Control</Text>
            <Text style={styles.subtitle}>Live status across mission systems.</Text>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Mission Control</Text>
              {latestLaunch ? (
                <>
                  <Text style={styles.sectionBody}>{latestLaunch.name || 'Latest Launch'}</Text>
                  <Text style={styles.sectionMeta}>
                    {latestLaunch.net ? new Date(latestLaunch.net).toLocaleString() : 'NET TBD'}
                  </Text>
                </>
              ) : (
                <Text style={styles.sectionBody}>Latest launch data unavailable.</Text>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Space Weather</Text>
              {solar ? (
                <>
                  <Text style={styles.sectionBody}>Class: {solar.strongestClass || 'N/A'}</Text>
                  <Text style={styles.sectionMeta}>Severity: {solar.severityPct ?? 'N/A'}%</Text>
                </>
              ) : (
                <Text style={styles.sectionBody}>No recent solar alerts.</Text>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Asteroid Flybys</Text>
              {neos.length ? (
                neos.slice(0, 3).map((neo, idx) => (
                  <Text key={`${neo.name}-${idx}`} style={styles.sectionBody}>
                    • {neo.name} — {neo.close_approach_date_full || neo.close_approach_date || 'TBD'}
                  </Text>
                ))
              ) : (
                <Text style={styles.sectionBody}>No flyby data available.</Text>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <Text style={styles.sectionTitle}>Upcoming Launches</Text>
              {upcomingLaunches.length ? (
                upcomingLaunches.map((launch, idx) => (
                  <Text key={`${launch.id || launch.name}-${idx}`} style={styles.sectionBody}>
                    • {launch.name || 'Launch'} — {launch.net ? new Date(launch.net).toLocaleDateString() : 'TBD'}
                  </Text>
                ))
              ) : (
                <Text style={styles.sectionBody}>No upcoming launches available.</Text>
              )}
              {providerSpotlights.length ? (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Provider Spotlights</Text>
                  {providerSpotlights.map((launch, idx) => (
                    <Text key={`${launch.providerName || 'provider'}-${idx}`} style={styles.sectionBody}>
                      • {launch.providerName || launch.providerType || 'Provider'} • {launch.name || 'Next Launch'} — {launch.net ? new Date(launch.net).toLocaleDateString() : 'TBD'}
                    </Text>
                  ))}
                </>
              ) : null}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Pressable onPress={() => navigation.navigate(ROUTE_MANIFEST.MISSION_ALERTS as never)}>
              <GlassCard variant="secondary">
                <Text style={styles.sectionTitle}>Mission Alerts</Text>
                <Text style={styles.sectionBody}>Review mission opportunities and accept challenges.</Text>
                <Text style={styles.sectionMeta}>Open Mission Alerts →</Text>
              </GlassCard>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  header: { marginBottom: spacing.lg },
  section: { marginTop: spacing.lg },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  muted: { marginTop: 8, color: colors.muted },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  sectionBody: { ...typography.body, color: colors.muted, marginBottom: 4 },
  sectionMeta: { ...typography.small, color: colors.dim },
})
