import React, { useMemo, useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet, View, FlatList, Pressable } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { PixelButton } from '../../components/home/PixelButton'
import { colors, spacing } from '../../theme/tokens'
import { listLearningModules, listTracks, listLevels, ROUTE_MANIFEST, getSession, getUserProgressForModule } from '@starkid/core'
import { CustomText } from '../../components/ui/CustomText'

export default function StemActivitiesScreen({ navigation }: { navigation: any }) {
  const [track, setTrack] = useState('')
  const [level, setLevel] = useState('')
  const [progressById, setProgressById] = useState<Record<string, any>>({})
  const [isAuthed, setIsAuthed] = useState(false)

  const [activities, setActivities] = useState([])
  const [loadingModules, setLoadingModules] = useState(true)

  useEffect(() => {
    let active = true
    async function loadModules() {
      try {
        setLoadingModules(true)
        const modules = await listLearningModules({
          moduleType: 'stem',
          track: track || undefined,
          level: level || undefined,
          audience: 'learner',
        })
        if (active) setActivities(modules)
      } catch (error) {
        if (active) setActivities([])
      } finally {
        if (active) setLoadingModules(false)
      }
    }
    loadModules()
    return () => {
      active = false
    }
  }, [track, level])

  useEffect(() => {
    let active = true
    async function loadProgress() {
      try {
        const session = await getSession()
        if (active) setIsAuthed(Boolean(session?.userId))
        if (!session?.userId) {
          if (active) setProgressById({})
          return
        }
        const entries = await Promise.all(
          activities.map(async (activity: any) => {
            const progress = await getUserProgressForModule(activity.id)
            return [activity.id, progress]
          })
        )
        if (active) setProgressById(Object.fromEntries(entries))
      } catch (error) {
        if (active) setProgressById({})
      }
    }
    if (activities.length) loadProgress()
    return () => {
      active = false
    }
  }, [activities])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
            <View>
              <CustomText variant="sectionLabel" style={styles.kicker}>STEM ACTIVITIES</CustomText>
              <CustomText variant="hero" style={styles.title}>Learning Modules</CustomText>
              <CustomText variant="body" style={styles.subtitle}>
                Filter by track or level and explore structured STEM activities.
              </CustomText>
              <PixelButton
                label="VIEW PROGRESS →"
                onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STEM_PROGRESS)}
                style={styles.progressButton}
              />

              <View style={styles.filterRow}>
                <Pressable style={styles.filterButton} onPress={() => setTrack('')}>
                  <CustomText variant="sectionLabel" style={styles.filterText}>All Tracks</CustomText>
                </Pressable>
                {listTracks().map((t) => (
                  <Pressable key={t} style={styles.filterButton} onPress={() => setTrack(t)}>
                    <CustomText variant="sectionLabel" style={styles.filterText}>{t}</CustomText>
                  </Pressable>
                ))}
              </View>
              <View style={styles.filterRow}>
                <Pressable style={styles.filterButton} onPress={() => setLevel('')}>
                  <CustomText variant="sectionLabel" style={styles.filterText}>All Levels</CustomText>
                </Pressable>
                {listLevels().map((l) => (
                  <Pressable key={l} style={styles.filterButton} onPress={() => setLevel(l)}>
                    <CustomText variant="sectionLabel" style={styles.filterText}>{l}</CustomText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STEM_ACTIVITY_DETAIL, { activityId: item.id })}
            >
              <GlassCard variant="secondary" style={styles.activityCard}>
                <CustomText variant="cardTitle" style={styles.activityTitle}>{item.title}</CustomText>
                <CustomText variant="bodySmall" style={styles.activityMeta}>
                  {item.track} • {item.level}
                </CustomText>
                {isAuthed && progressById[item.id]?.status === 'completed' ? (
                  <CustomText variant="bodySmall" style={styles.statusComplete}>
                    Completed{item.xpReward ? ` • +${item.xpReward} XP` : ''}
                  </CustomText>
                ) : isAuthed && progressById[item.id]?.status === 'in_progress' ? (
                  <CustomText variant="bodySmall" style={styles.statusProgress}>
                    In Progress
                  </CustomText>
                ) : isAuthed ? (
                  <CustomText variant="bodySmall" style={styles.statusNotStarted}>
                    Not Started
                  </CustomText>
                ) : null}
                <CustomText variant="body" style={styles.activityBody}>{item.description}</CustomText>
                <PixelButton
                  label="ACCESS MODULE"
                  onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STEM_ACTIVITY_DETAIL, { activityId: item.id })}
                  style={styles.accessButton}
                />
              </GlassCard>
            </Pressable>
          )}
          ListFooterComponent={() => (
            <>
              {loadingModules ? (
                <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                  <CustomText variant="body" style={styles.cardText}>Loading modules from Command...</CustomText>
                </GlassCard>
              ) : activities.length === 0 ? (
                <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                  <CustomText variant="body" style={styles.cardText}>
                    No modules available right now.
                  </CustomText>
                </GlassCard>
              ) : (
                <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                  <CustomText variant="body" style={styles.cardText}>
                    We’re building lesson-ready activities for classrooms and self-guided missions.
                  </CustomText>
                </GlassCard>
              )}
            </>
          )}
        />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  cardText: { color: colors.muted },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  filterText: { color: colors.text },
  activityTitle: { color: colors.text },
  activityMeta: { color: colors.muted, marginTop: spacing.xs },
  statusComplete: { color: '#4ade80', marginTop: 4 },
  statusProgress: { color: '#facc15', marginTop: 4 },
  statusNotStarted: { color: colors.dim, marginTop: 4 },
  activityBody: { color: colors.muted, marginTop: 6 },
  activityCard: { marginTop: spacing.md },
  accessButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.6)',
    backgroundColor: 'rgba(6, 10, 22, 0.7)',
  },
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
})
