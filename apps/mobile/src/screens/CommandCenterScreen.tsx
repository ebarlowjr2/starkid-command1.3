import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, ScrollView } from 'react-native'
import { getSolarActivity, getAsteroidFlybys, getLatestLaunch, getUpcomingLaunchesWindow, getProviderSpotlights, getLaunchAlerts, ROUTE_MANIFEST } from '@starkid/core'
import { useNavigation } from '@react-navigation/native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

export default function CommandCenterScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [solar, setSolar] = useState<any | null>(null)
  const [neos, setNeos] = useState<any[]>([])
  const [latestLaunch, setLatestLaunch] = useState<any | null>(null)
  const [upcomingLaunches, setUpcomingLaunches] = useState<any[]>([])
  const [providerSpotlights, setProviderSpotlights] = useState<any[]>([])
  const [launchAlerts, setLaunchAlerts] = useState<any[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [solarResult, neosResult, latestResult, upcomingResult, providerResult, launchAlertsResult] = await Promise.allSettled([
          getSolarActivity({ days: 3 }),
          getAsteroidFlybys(),
          getLatestLaunch(),
          getUpcomingLaunchesWindow({ days: 7, limit: 7 }),
          getProviderSpotlights(),
          getLaunchAlerts(),
        ])
        if (active) {
          setSolar(solarResult.status === 'fulfilled' ? solarResult.value?.data : null)
          setNeos(neosResult.status === 'fulfilled' ? neosResult.value?.data || [] : [])
          setLatestLaunch(latestResult.status === 'fulfilled' ? latestResult.value?.data : null)
          setUpcomingLaunches(upcomingResult.status === 'fulfilled' ? upcomingResult.value?.data || [] : [])
          setProviderSpotlights(providerResult.status === 'fulfilled' ? providerResult.value?.data || [] : [])
          setLaunchAlerts(launchAlertsResult.status === 'fulfilled' ? launchAlertsResult.value?.data || [] : [])
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
          <CustomText variant="body" style={styles.muted}>
            Loading mission alerts…
          </CustomText>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <CustomText variant="sectionLabel" style={styles.kicker}>
              COMMAND CENTER
            </CustomText>
            <CustomText variant="hero" style={styles.title}>
              Mission Control
            </CustomText>
            <CustomText variant="body" style={styles.subtitle}>
              Live status across mission systems.
            </CustomText>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Mission Control</CustomText>
              {latestLaunch ? (
                <>
                  <CustomText variant="body" style={styles.sectionBody}>{latestLaunch.name || 'Latest Launch'}</CustomText>
                  <CustomText variant="bodySmall" style={styles.sectionMeta}>
                    {latestLaunch.net ? new Date(latestLaunch.net).toLocaleString() : 'NET TBD'}
                  </CustomText>
                </>
              ) : (
                <CustomText variant="body" style={styles.sectionBody}>Latest launch data unavailable.</CustomText>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Space Weather</CustomText>
              {solar ? (
                <>
                  <CustomText variant="body" style={styles.sectionBody}>Class: {solar.strongestClass || 'N/A'}</CustomText>
                  <CustomText variant="bodySmall" style={styles.sectionMeta}>Severity: {solar.severityPct ?? 'N/A'}%</CustomText>
                </>
              ) : (
                <CustomText variant="body" style={styles.sectionBody}>No recent solar alerts.</CustomText>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Asteroid Flybys</CustomText>
              {neos.length ? (
                neos.slice(0, 3).map((neo, idx) => (
                  <CustomText key={`${neo.name}-${idx}`} variant="body" style={styles.sectionBody}>
                    • {neo.name} — {neo.close_approach_date_full || neo.close_approach_date || 'TBD'}
                  </CustomText>
                ))
              ) : (
                <CustomText variant="body" style={styles.sectionBody}>No flyby data available.</CustomText>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Upcoming Launches</CustomText>
              {upcomingLaunches.length ? (
                upcomingLaunches.map((launch, idx) => (
                  <CustomText key={`${launch.id || launch.name}-${idx}`} variant="body" style={styles.sectionBody}>
                    • {launch.name || 'Launch'} — {launch.net ? new Date(launch.net).toLocaleDateString() : 'TBD'}
                  </CustomText>
                ))
              ) : (
                <CustomText variant="body" style={styles.sectionBody}>No upcoming launches available.</CustomText>
              )}
              {providerSpotlights.length ? (
                <>
                  <CustomText variant="sectionLabel" style={[styles.sectionTitle, { marginTop: spacing.md }]}>
                    Provider Spotlights
                  </CustomText>
                  {providerSpotlights.map((launch, idx) => (
                    <CustomText key={`${launch.providerName || 'provider'}-${idx}`} variant="body" style={styles.sectionBody}>
                      • {launch.providerName || launch.providerType || 'Provider'} • {launch.name || 'Next Launch'} — {launch.net ? new Date(launch.net).toLocaleDateString() : 'TBD'}
                    </CustomText>
                  ))}
                </>
              ) : null}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <GlassCard variant="secondary">
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>Launch Alerts (24h)</CustomText>
              {launchAlerts.length ? (
                launchAlerts.map((alert, idx) => (
                  <View key={`${alert.id}-${idx}`} style={styles.alertRow}>
                    <CustomText variant="sectionLabel" style={styles.alertBadge}>LAUNCH</CustomText>
                    <CustomText variant="body" style={styles.sectionBody}>
                      {alert.title || 'Launch'} — {alert.startTime ? new Date(alert.startTime).toLocaleString() : 'NET TBD'}
                    </CustomText>
                  </View>
                ))
              ) : (
                <CustomText variant="body" style={styles.sectionBody}>No launches within 24 hours.</CustomText>
              )}
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Pressable onPress={() => navigation.navigate(ROUTE_MANIFEST.MISSION_ALERTS as never)}>
              <GlassCard variant="secondary">
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Mission Alerts</CustomText>
                <CustomText variant="body" style={styles.sectionBody}>Review mission opportunities and accept challenges.</CustomText>
                <CustomText variant="bodySmall" style={styles.sectionMeta}>Open Mission Alerts →</CustomText>
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
  kicker: { color: colors.dim, marginBottom: 6 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  muted: { marginTop: 8, color: colors.muted },
  sectionTitle: { color: colors.dim, marginBottom: spacing.sm },
  sectionBody: { color: colors.muted, marginBottom: 4 },
  sectionMeta: { color: colors.dim },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  alertBadge: {
    color: colors.accent,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
})
