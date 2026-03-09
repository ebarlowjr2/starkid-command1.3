import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, ScrollView } from 'react-native'
import { getAlertsForUser, convertAlertToMission, getRepos, ROUTE_MANIFEST, listTracks, listLevels, formatSourceStatus, getSolarActivity, getAsteroidFlybys, getLatestLaunch } from '@starkid/core'
import { setMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing, typography } from '../theme/tokens'

export default function CommandCenterScreen() {
  const navigation = useNavigation()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [solar, setSolar] = useState<any | null>(null)
  const [neos, setNeos] = useState<any[]>([])
  const [latestLaunch, setLatestLaunch] = useState<any | null>(null)
  const [alertSources, setAlertSources] = useState<any[]>([])
  const [stemTrack, setStemTrack] = useState('math')
  const [stemLevel, setStemLevel] = useState('cadet')
  const tracks = listTracks()
  const levels = listLevels()

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [alertsResult, solarResult, neosResult, latestResult] = await Promise.allSettled([
          getAlertsForUser(),
          getSolarActivity({ days: 3 }),
          getAsteroidFlybys(),
          getLatestLaunch(),
        ])
        const alertPayload = alertsResult.status === 'fulfilled' ? alertsResult.value : { data: [], sources: [] }
        const list = alertPayload.data || []
        const sources = alertPayload.sources || []
        if (active) setAlertSources(sources || [])
        if (!list?.length) {
          if (active) setAlerts([])
        } else {
          const { missionsRepo, actor } = await getRepos()
          const enriched = await Promise.all(
            list.map(async (alert) => {
              const mission = convertAlertToMission(alert, stemTrack, stemLevel)
              if (!mission) return { ...alert, completed: false }
              const completed = await missionsRepo.isCompleted(actor.actorId, mission.id)
              return {
                ...alert,
                completed,
                missionId: mission.id,
                missionTitle: mission.title,
                missionTrack: mission.track,
                missionLevel: mission.level,
                eventSource: mission.eventSource,
              }
            })
          )
          if (active) setAlerts(enriched || [])
        }
        if (active) {
          setSolar(solarResult.status === 'fulfilled' ? solarResult.value?.data : null)
          setNeos(neosResult.status === 'fulfilled' ? neosResult.value?.data || [] : [])
          setLatestLaunch(latestResult.status === 'fulfilled' ? latestResult.value?.data : null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [stemTrack, stemLevel])

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
            <Text style={styles.title}>Mission Alerts</Text>
            <Text style={styles.subtitle}>Accept a mission to view the briefing.</Text>
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>TRACK</Text>
                <View style={styles.chipRow}>
                  {tracks.map((track) => (
                    <Pressable
                      key={track}
                      style={[styles.chip, stemTrack === track && styles.chipActive]}
                      onPress={() => setStemTrack(track)}
                    >
                      <Text style={[styles.chipText, stemTrack === track && styles.chipTextActive]}>
                        {track.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.pickerRow, { marginTop: spacing.sm }]}>
                <Text style={styles.pickerLabel}>LEVEL</Text>
                <View style={styles.chipRow}>
                  {levels.map((level) => (
                    <Pressable
                      key={level}
                      style={[styles.chip, stemLevel === level && styles.chipActive]}
                      onPress={() => setStemLevel(level)}
                    >
                      <Text style={[styles.chipText, stemLevel === level && styles.chipTextActive]}>
                        {level.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </GlassCard>
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <View style={styles.badgeRow}>
                <Badge label="ALERTS" />
                <Text style={styles.badgeHelper}>Sorted by time + priority</Text>
              </View>
            </GlassCard>
            {__DEV__ && alertSources.length ? (
              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <Text style={styles.debugText}>{formatSourceStatus(alertSources)}</Text>
              </GlassCard>
            ) : null}
          </View>

          <View style={styles.section}>
            {alerts.length ? (
              alerts.map((item) => (
                <GlassCard key={item.id} variant="secondary" style={styles.card}>
                  <View style={styles.glowStrip} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>{item.missionTitle || item.title}</Text>
                    <Text style={styles.alertMeta}>{item.type} • {item.severity}</Text>
                    <View style={styles.badgeRow}>
                      <Text style={styles.missionBadge}>MISSION</Text>
                      <Text style={styles.trackBadge}>{String(item.missionTrack || stemTrack).toUpperCase()}</Text>
                      <Text style={styles.levelBadge}>{String(item.missionLevel || stemLevel).toUpperCase()}</Text>
                    </View>
                  </View>
                  {item.completed ? (
                    <Text style={styles.completedBadge}>COMPLETED</Text>
                  ) : item.missionAvailable ? (
                    <Pressable
                      style={styles.alertButton}
                      onPress={async () => {
                        const mission = convertAlertToMission(item, stemTrack, stemLevel)
                        if (!mission) return
                        setMission(mission)
                        navigation.navigate(ROUTE_MANIFEST.MISSIONS_BRIEFING as never, { missionId: mission.id } as never)
                      }}
                    >
                      <Text style={styles.alertButtonText}>ACCEPT →</Text>
                    </Pressable>
                  ) : null}
                </GlassCard>
              ))
            ) : (
              <GlassCard variant="secondary">
                <Text style={styles.emptyText}>No alerts available.</Text>
              </GlassCard>
            )}
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
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeHelper: { ...typography.pixel, color: colors.dim, flex: 1 },
  pickerRow: { marginBottom: spacing.xs },
  pickerLabel: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    backgroundColor: 'rgba(9, 14, 26, 0.4)',
  },
  chipActive: {
    borderColor: 'rgba(61,235,255,0.9)',
    backgroundColor: 'rgba(61,235,255,0.18)',
  },
  chipText: { ...typography.pixel, color: colors.dim },
  chipTextActive: { color: colors.text },
  muted: { marginTop: 8, color: colors.muted },
  card: { marginBottom: 12 },
  debugText: { ...typography.small, color: colors.dim },
  glowStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(61,235,255,0.35)',
  },
  alertTitle: { ...typography.h2, color: colors.text },
  alertMeta: { ...typography.small, color: colors.muted, marginTop: 6 },
  alertButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.6)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  alertButtonText: { ...typography.small, color: colors.text },
  completedBadge: { ...typography.pixel, color: colors.green },
  emptyText: { ...typography.body, color: colors.muted },
  missionBadge: { ...typography.pixel, color: colors.accent },
  trackBadge: { ...typography.pixel, color: colors.text },
  levelBadge: { ...typography.pixel, color: colors.dim },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  sectionBody: { ...typography.body, color: colors.muted, marginBottom: 4 },
  sectionMeta: { ...typography.small, color: colors.dim },
})
