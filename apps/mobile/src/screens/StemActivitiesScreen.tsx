import React, { useMemo, useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet, Text, View, FlatList, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { listStemActivities, listTracks, listLevels, ROUTE_MANIFEST, listCompletedStemActivities } from '@starkid/core'

export default function StemActivitiesScreen({ navigation }: { navigation: any }) {
  const [track, setTrack] = useState('')
  const [level, setLevel] = useState('')
  const [completedIds, setCompletedIds] = useState<string[]>([])

  const activities = useMemo(() => {
    return listStemActivities({
      track: track || undefined,
      level: level || undefined,
    })
  }, [track, level])

  useEffect(() => {
    let active = true
    async function loadCompleted() {
      try {
        const completed = await listCompletedStemActivities()
        if (active) setCompletedIds((completed || []).map((item) => item.activityId))
      } catch (error) {
        if (active) setCompletedIds([])
      }
    }
    loadCompleted()
    return () => {
      active = false
    }
  }, [])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
            <View>
              <Text style={styles.kicker}>STEM ACTIVITIES</Text>
              <Text style={styles.title}>Learning Modules</Text>
              <Text style={styles.subtitle}>
                Filter by track or level and explore structured STEM activities.
              </Text>
              <Pressable
                style={styles.progressButton}
                onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STEM_PROGRESS)}
              >
                <Text style={styles.progressButtonText}>VIEW PROGRESS →</Text>
              </Pressable>

              <View style={styles.filterRow}>
                <Pressable style={styles.filterButton} onPress={() => setTrack('')}>
                  <Text style={styles.filterText}>All Tracks</Text>
                </Pressable>
                {listTracks().map((t) => (
                  <Pressable key={t} style={styles.filterButton} onPress={() => setTrack(t)}>
                    <Text style={styles.filterText}>{t}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.filterRow}>
                <Pressable style={styles.filterButton} onPress={() => setLevel('')}>
                  <Text style={styles.filterText}>All Levels</Text>
                </Pressable>
                {listLevels().map((l) => (
                  <Pressable key={l} style={styles.filterButton} onPress={() => setLevel(l)}>
                    <Text style={styles.filterText}>{l}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STEM_ACTIVITY_DETAIL, { activityId: item.id })}
            >
              <GlassCard variant="secondary" style={{ marginTop: spacing.md }}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  {completedIds.includes(item.id) ? (
                    <Text style={styles.completedBadge}>COMPLETED</Text>
                  ) : null}
                </View>
                <Text style={styles.activityMeta}>{item.track} • {item.level}</Text>
                <Text style={styles.activityBody}>{item.description}</Text>
              </GlassCard>
            </Pressable>
          )}
          ListFooterComponent={() => (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.cardText}>
                We’re building lesson-ready activities for classrooms and self-guided missions.
              </Text>
            </GlassCard>
          )}
        />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  cardText: { ...typography.body, color: colors.muted },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  filterText: { ...typography.pixel, color: colors.text },
  activityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityTitle: { ...typography.h2, color: colors.text },
  activityMeta: { ...typography.small, color: colors.muted, marginTop: 6 },
  activityBody: { ...typography.body, color: colors.muted, marginTop: 6 },
  completedBadge: { ...typography.pixel, color: colors.green },
  progressButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.6)',
    backgroundColor: 'rgba(6, 10, 22, 0.7)',
  },
  progressButtonText: { ...typography.pixel, color: colors.text },
})
