import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList, SafeAreaView } from 'react-native'
import { getAlertsForUser, convertAlertToMission, getRepos, ROUTE_MANIFEST, listTracks, listLevels, formatSourceStatus } from '@starkid/core'
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
  const [alertSources, setAlertSources] = useState<any[]>([])
  const [stemTrack, setStemTrack] = useState('math')
  const [stemLevel, setStemLevel] = useState('cadet')
  const tracks = listTracks()
  const levels = listLevels()

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: list, sources } = await getAlertsForUser()
        if (active) setAlertSources(sources || [])
        if (!list?.length) {
          if (active) setAlerts([])
          return
        }
        const { missionsRepo, actor } = await getRepos()
        const enriched = await Promise.all(
          list.map(async (alert) => {
            const mission = convertAlertToMission(alert, stemTrack, stemLevel)
            if (!mission) return { ...alert, completed: false }
            const completed = await missionsRepo.isCompleted(actor.actorId, mission.id)
            return { ...alert, completed, missionId: mission.id }
          })
        )
        if (active) setAlerts(enriched || [])
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
        <FlatList
          data={alerts}
          keyExtractor={(item, index) => `${item.id ?? index}`}
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
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
          )}
          renderItem={({ item }) => (
            <GlassCard variant="secondary" style={styles.card}>
              <View style={styles.glowStrip} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertMeta}>{item.type} • {item.severity}</Text>
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
                    navigation.navigate(ROUTE_MANIFEST.MISSIONS_BRIEFING as never)
                  }}
                >
                  <Text style={styles.alertButtonText}>ACCEPT →</Text>
                </Pressable>
              ) : null}
            </GlassCard>
          )}
          ListEmptyComponent={() => (
            <GlassCard variant="secondary">
              <Text style={styles.emptyText}>No alerts available.</Text>
            </GlassCard>
          )}
        />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  header: { marginBottom: spacing.lg },
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
})
