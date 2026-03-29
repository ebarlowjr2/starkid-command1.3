import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { PixelButton } from '../../components/home/PixelButton'
import { colors, spacing } from '../../theme/tokens'
import { getLearningModuleById, isStemActivityCompleted, markStemActivityCompleted, getSession, getUserProgressForModule } from '@starkid/core'
import { CustomText } from '../../components/ui/CustomText'
import { SyncIdentityModal } from '../../components/auth/SyncIdentityModal'

export default function StemActivityDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { activityId } = route?.params || {}
  const [activity, setActivity] = useState<any | null>(null)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const hasMissionEntry = Boolean(activity?.missionContext || activity?.objective)
  const levelLabel = activity?.level ? `${activity.level.charAt(0).toUpperCase()}${activity.level.slice(1)}` : ''
  const [showSync, setShowSync] = useState(false)
  const [resumeStep, setResumeStep] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    async function loadActivity() {
      try {
        const module = await getLearningModuleById(activityId)
        if (active) setActivity(module)
      } catch (error) {
        if (active) setActivity(null)
      }
    }
    if (activityId) loadActivity()
    return () => {
      active = false
    }
  }, [activityId])

  useEffect(() => {
    let active = true
    async function loadProgress() {
      try {
        const session = await getSession()
        if (!session?.userId) {
          if (active) setResumeStep(null)
          return
        }
        const progress = await getUserProgressForModule(activityId)
        if (active && progress?.status === 'in_progress') {
          setResumeStep(progress.currentStepIndex + 1)
        }
        if (active && progress?.status === 'completed') {
          setCompleted(true)
        }
      } catch (error) {
        if (active) setResumeStep(null)
      }
    }
    if (activityId) loadProgress()
    return () => {
      active = false
    }
  }, [activityId])

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
          {hasMissionEntry ? (
            <>
              <CustomText variant="body" style={styles.tagline}>
                {activity.tagline || 'Mission math for stable liftoff performance'}
              </CustomText>
              <CustomText variant="bodySmall" style={styles.subtitle}>
                {(activity.trainingType || 'Math')} • {levelLabel || 'Cadet'} • {activity.blockCount || 7} Blocks • {activity.estimatedMinutes || 5} min
              </CustomText>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Mission Context</CustomText>
                <CustomText variant="body" style={styles.body}>
                  {activity.missionContext || 'Mission Control requires verification of the fuel mixture before launch. Incorrect oxidizer-to-fuel ratios can reduce thrust efficiency and increase the risk of unstable liftoff performance.'}
                </CustomText>
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>Objective</CustomText>
                <CustomText variant="body" style={styles.body}>
                  {activity.objective || 'Determine the correct oxidizer-to-fuel ratio for the rocket stage and prepare your response for Command review.'}
                </CustomText>
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>In this mission, you will</CustomText>
                {(activity.missionOutcomes || [
                  'Review the mission brief',
                  'Learn the fuel ratio concept',
                  'Follow guided instructions',
                  'Study a worked example',
                  'Calculate a numeric answer',
                  'Explain your reasoning',
                  'Submit your result to Command',
                ]).map((item) => (
                  <CustomText key={item} variant="bodySmall" style={styles.stepItem}>• {item}</CustomText>
                ))}
              </GlassCard>

              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <CustomText variant="sectionLabel" style={styles.sectionTitle}>
                  {(activity.blockCount || 7)} Guided Steps
                </CustomText>
                {(activity.blockList || [
                  'mission_brief',
                  'concept',
                  'instruction',
                  'question_numeric',
                  'question_short_text',
                  'checkpoint',
                  'submission_prompt',
                ]).map((item) => (
                  <CustomText key={item} variant="bodySmall" style={styles.stepItem}>• {item}</CustomText>
                ))}
              </GlassCard>

              <View style={{ marginTop: spacing.lg }}>
                <PixelButton
                  label={activity.lessonSlug ? 'START MISSION' : 'COMING SOON'}
                  onPress={async () => {
                    if (!activity.lessonSlug) return
                    const session = await getSession()
                    if (!session?.userId) {
                      setShowSync(true)
                      return
                    }
                    navigation?.navigate?.('LessonPlayer', { slug: activity.lessonSlug })
                  }}
                  style={styles.completeButton}
                />
              </View>
              {resumeStep ? (
                <CustomText variant="bodySmall" style={styles.resume}>
                  Resume available: Step {resumeStep}
                </CustomText>
              ) : null}
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
          <SyncIdentityModal open={showSync} onClose={() => setShowSync(false)} onSync={() => setShowSync(false)} />
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
  resume: { color: colors.cyan, marginTop: spacing.sm },
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
