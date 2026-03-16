import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { PixelButton } from '../../components/home/PixelButton'
import { colors, spacing, typography } from '../../theme/tokens'
import { getStemActivityById, isStemActivityCompleted, markStemActivityCompleted } from '@starkid/core'

export default function StemActivityDetailScreen({ route }: { route: any }) {
  const { activityId } = route?.params || {}
  const activity = getStemActivityById(activityId)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function loadCompleted() {
      try {
        const isDone = await isStemActivityCompleted(activityId)
        if (active) setCompleted(isDone)
      } catch (error) {
        if (active) setCompleted(false)
      }
    }
    if (activityId) loadCompleted()
    return () => {
      active = false
    }
  }, [activityId])

  if (!activity) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <Text style={styles.muted}>Activity not found.</Text>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>STEM ACTIVITY</Text>
          <Text style={styles.title}>{activity.title}</Text>
          <Text style={styles.subtitle}>{activity.track} • {activity.level}</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.body}>{activity.description}</Text>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Steps</Text>
            {activity.steps.map((step) => (
              <Text key={step.id} style={styles.stepItem}>• {step.prompt}</Text>
            ))}
          </GlassCard>

          <View style={{ marginTop: spacing.lg }}>
            {completed ? (
              <Text style={styles.completedBadge}>COMPLETED</Text>
            ) : (
              <PixelButton
                label="MARK COMPLETE"
                onPress={async () => {
                  try {
                    setSaving(true)
                    await markStemActivityCompleted(activity.id, activity)
                    setCompleted(true)
                  } finally {
                    setSaving(false)
                  }
                }}
                style={styles.completeButton}
              />
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
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.small, color: colors.muted, marginTop: 6 },
  body: { ...typography.body, color: colors.muted },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  stepItem: { ...typography.body, color: colors.muted, marginTop: 6 },
  muted: { ...typography.body, color: colors.muted },
  completeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.7)',
    backgroundColor: 'rgba(6, 10, 22, 0.8)',
  },
  completedBadge: { ...typography.pixel, color: colors.green },
})
