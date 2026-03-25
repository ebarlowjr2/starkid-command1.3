import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { PixelButton } from '../../components/home/PixelButton'
import { colors, spacing } from '../../theme/tokens'
import { getStemActivityById, isStemActivityCompleted, markStemActivityCompleted } from '@starkid/core'
import { CustomText } from '../../components/ui/CustomText'

export default function StemActivityDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { activityId } = route?.params || {}
  const activity = getStemActivityById(activityId)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const isFuelRatio = activity?.id === 'math.launch.fuel-ratio'

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
          <CustomText variant="body" style={styles.muted}>Activity not found.</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>STEM ACTIVITY</CustomText>
          <CustomText variant="hero" style={styles.title}>{activity.title}</CustomText>
          {isFuelRatio ? (
            <>
              <CustomText variant="body" style={styles.tagline}>Mission math for stable liftoff performance</CustomText>
              <CustomText variant="bodySmall" style={styles.subtitle}>Math • Cadet • 10 Blocks</CustomText>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Mission Context</CustomText>
                <CustomText variant="body" style={styles.body}>
                  Mission Control requires verification of the fuel mixture before launch. Incorrect oxidizer-to-fuel ratios can reduce thrust efficiency and increase the risk of unstable liftoff performance.
                </CustomText>
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Objective</CustomText>
                <CustomText variant="body" style={styles.body}>
                  Determine the correct oxidizer-to-fuel ratio for the rocket stage and prepare your response for Command review.
                </CustomText>
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>In this mission, you will</CustomText>
                {[
                  'review the mission brief',
                  'learn the fuel ratio concept',
                  'follow guided instructions',
                  'study a worked example',
                  'calculate a numeric answer',
                  'explain your reasoning',
                  'submit your result to Command',
                ].map((item) => (
                  <CustomText key={item} variant="bodySmall" style={styles.stepItem}>• {item}</CustomText>
                ))}
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Blocks: 10</CustomText>
                {[
                  'mission_brief',
                  'concept',
                  'instruction',
                  'worked_example',
                  'question_numeric',
                  'hint',
                  'question_short_text',
                  'checkpoint',
                  'submission_prompt',
                  'completion',
                ].map((block) => (
                  <CustomText key={block} variant="bodySmall" style={styles.stepItem}>• {block}</CustomText>
                ))}
              </GlassCard>

              <View style={{ marginTop: spacing.lg }}>
                <PixelButton
                  label="START MISSION"
                  onPress={() => navigation?.navigate?.('LessonPlayer', { slug: 'launch-fuel-ratio-calculation' })}
                  style={styles.completeButton}
                />
              </View>
            </>
          ) : (
            <>
              <CustomText variant="bodySmall" style={styles.subtitle}>{activity.track} • {activity.level}</CustomText>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="body" style={styles.body}>{activity.description}</CustomText>
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Steps</CustomText>
                {activity.steps.map((step) => (
                  <CustomText key={step.id} variant="body" style={styles.stepItem}>• {step.prompt}</CustomText>
                ))}
              </GlassCard>

              <View style={{ marginTop: spacing.lg }}>
                {completed ? (
                  <CustomText variant="sectionLabel" style={styles.completedBadge}>COMPLETED</CustomText>
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
            </>
          )}
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
  tagline: { color: colors.muted, marginTop: spacing.xs },
  subtitle: { color: colors.muted, marginTop: 6 },
  body: { color: colors.muted },
  sectionTitle: { color: colors.dim, marginBottom: spacing.sm },
  stepItem: { color: colors.muted, marginTop: 6 },
  muted: { color: colors.muted },
  completeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.7)',
    backgroundColor: 'rgba(6, 10, 22, 0.8)',
  },
  completedBadge: { color: colors.green },
})
