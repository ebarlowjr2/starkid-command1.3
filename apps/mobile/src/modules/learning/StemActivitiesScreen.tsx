import React, { useMemo, useState, useEffect } from 'react'
import { SafeAreaView, StyleSheet, View, FlatList, Pressable } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { PixelButton } from '../../components/home/PixelButton'
import { colors, spacing } from '../../theme/tokens'
import { listStemActivities, listTracks, listLevels, ROUTE_MANIFEST, listCompletedStemActivities } from '@starkid/core'
import { CustomText } from '../../components/ui/CustomText'

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
                <CustomText variant="body" style={styles.activityBody}>{item.description}</CustomText>
              </GlassCard>
            </Pressable>
          )}
          ListFooterComponent={() => (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.cardText}>
                We’re building lesson-ready activities for classrooms and self-guided missions.
              </CustomText>
            </GlassCard>
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
  activityBody: { color: colors.muted, marginTop: 6 },
  activityCard: { marginTop: spacing.md },
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
