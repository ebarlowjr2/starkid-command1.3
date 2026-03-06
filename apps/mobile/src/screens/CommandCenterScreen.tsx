import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList, SafeAreaView } from 'react-native'
import { getAlertsForUser, convertAlertToMission, getRepos, ROUTE_MANIFEST } from '@starkid/core'
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

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: list } = await getAlertsForUser()
        if (!list?.length) {
          if (active) setAlerts([])
          return
        }
        const { missionsRepo, actor } = await getRepos()
        const enriched = await Promise.all(
          list.map(async (alert) => {
            const mission = convertAlertToMission(alert)
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
                <View style={styles.badgeRow}>
                  <Badge label="ALERTS" />
                  <Text style={styles.badgeHelper}>Sorted by time + priority</Text>
                </View>
              </GlassCard>
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
                    const mission = convertAlertToMission(item)
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
  muted: { marginTop: 8, color: colors.muted },
  card: { marginBottom: 12 },
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
