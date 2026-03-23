import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, ScrollView } from 'react-native'
import { getAlertsForUser, generateMissionFromAlert, getRepos, ROUTE_MANIFEST, listTracks, listLevels, formatSourceStatus } from '@starkid/core'
import { setMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

export default function MissionAlertsScreen() {
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
        const { missionsRepo, actor } = await getRepos()
        const enriched = await Promise.all(
          (list || []).map(async (alert) => {
            const mission = generateMissionFromAlert(alert, stemTrack, stemLevel)
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
          <CustomText variant="body" style={styles.muted}>Loading mission alerts…</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>MISSION ALERTS</CustomText>
          <CustomText variant="hero" style={styles.title}>Mission Opportunities</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Select a track and level, then accept a mission.</CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <View style={styles.pickerRow}>
              <CustomText variant="sectionLabel" style={styles.pickerLabel}>TRACK</CustomText>
              <View style={styles.chipRow}>
                {tracks.map((track) => (
                  <Pressable
                    key={track}
                    style={[styles.chip, stemTrack === track && styles.chipActive]}
                    onPress={() => setStemTrack(track)}
                  >
                    <CustomText variant="sectionLabel" style={[styles.chipText, stemTrack === track && styles.chipTextActive]}>
                      {track.toUpperCase()}
                    </CustomText>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={[styles.pickerRow, { marginTop: spacing.sm }]}>
              <CustomText variant="sectionLabel" style={styles.pickerLabel}>LEVEL</CustomText>
              <View style={styles.chipRow}>
                {levels.map((level) => (
                  <Pressable
                    key={level}
                    style={[styles.chip, stemLevel === level && styles.chipActive]}
                    onPress={() => setStemLevel(level)}
                  >
                    <CustomText variant="sectionLabel" style={[styles.chipText, stemLevel === level && styles.chipTextActive]}>
                      {level.toUpperCase()}
                    </CustomText>
                  </Pressable>
                ))}
              </View>
            </View>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <View style={styles.badgeRow}>
              <Badge label="ALERTS" />
              <CustomText variant="sectionLabel" style={styles.badgeHelper}>Sorted by time + priority</CustomText>
            </View>
          </GlassCard>

          {__DEV__ && alertSources.length ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="bodySmall" style={styles.debugText}>{formatSourceStatus(alertSources)}</CustomText>
            </GlassCard>
          ) : null}

          <View style={styles.section}>
            {alerts.length ? (
              alerts.map((item) => (
                <GlassCard key={item.id} variant="secondary" style={styles.card}>
                  <View style={styles.glowStrip} />
                  <View style={{ flex: 1 }}>
                    <CustomText variant="cardTitle" style={styles.alertTitle}>{item.missionTitle || item.title}</CustomText>
                    <CustomText variant="bodySmall" style={styles.alertMeta}>{item.type} • {item.severity}</CustomText>
                    <View style={styles.badgeRow}>
                      <CustomText variant="sectionLabel" style={styles.missionBadge}>MISSION</CustomText>
                      <CustomText variant="sectionLabel" style={styles.trackBadge}>{String(item.missionTrack || stemTrack).toUpperCase()}</CustomText>
                      <CustomText variant="sectionLabel" style={styles.levelBadge}>{String(item.missionLevel || stemLevel).toUpperCase()}</CustomText>
                    </View>
                  </View>
                  {item.completed ? (
                    <CustomText variant="sectionLabel" style={styles.completedBadge}>COMPLETED</CustomText>
                  ) : item.missionAvailable ? (
                    <PixelButton
                      label="ACCEPT →"
                      onPress={async () => {
                        const mission = generateMissionFromAlert(item, stemTrack, stemLevel)
                        if (!mission) return
                        setMission(mission)
                        navigation.navigate(ROUTE_MANIFEST.MISSIONS_BRIEFING as never, { missionId: mission.id } as never)
                      }}
                      style={styles.alertButton}
                    />
                  ) : null}
                </GlassCard>
              ))
            ) : (
              <GlassCard variant="secondary">
                <CustomText variant="body" style={styles.emptyText}>No alerts available.</CustomText>
              </GlassCard>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  kicker: { color: colors.dim, marginBottom: 6 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeHelper: { color: colors.dim, flex: 1 },
  pickerRow: { marginBottom: spacing.xs },
  pickerLabel: { color: colors.dim, marginBottom: 6 },
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
  chipText: { color: colors.dim },
  chipTextActive: { color: colors.text },
  muted: { marginTop: 8, color: colors.muted },
  section: { marginTop: spacing.lg },
  card: { marginBottom: 12 },
  glowStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(61,235,255,0.35)',
  },
  alertTitle: { color: colors.text },
  alertMeta: { color: colors.muted, marginTop: 6 },
  alertButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.6)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  completedBadge: { color: colors.green },
  emptyText: { color: colors.muted },
  missionBadge: { color: colors.accent },
  trackBadge: { color: colors.text },
  levelBadge: { color: colors.dim },
  debugText: { color: colors.dim },
})
