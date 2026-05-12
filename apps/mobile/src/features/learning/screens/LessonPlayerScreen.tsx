import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import {
  getLessonBySlug,
  initLessonPlayer,
  hydrateLessonPlayer,
  setAnswer,
  validateCurrentBlock,
  goNext,
  goPrev,
  submitLesson,
  getLearningModuleByLessonSlug,
  startModuleProgress,
  saveModuleProgress,
  submitModuleForUser,
  completeModuleProgress,
  getUserProgressForModule,
  ROUTE_MANIFEST,
  awardXpForModuleCompletion,
} from '@starkid/core'
import { getSession } from '@starkid/core'
import { SpaceBackground } from '../../../components/home/SpaceBackground'
import { GlassCard } from '../../../components/home/GlassCard'
import { PixelButton } from '../../../components/home/PixelButton'
import { colors, spacing } from '../../../theme/tokens'
import { CustomText } from '../../../components/ui/CustomText'
import LessonHeader from '../components/LessonHeader'
import BlockRenderer from '../components/BlockRenderer'
import { SyncIdentityModal } from '../../../components/auth/SyncIdentityModal'
import { CommonActions } from '@react-navigation/native'

export default function LessonPlayerScreen({ route, navigation }: any) {
  const slug = route?.params?.slug
  const [lesson, setLesson] = useState<any | null>(null)
  const [module, setModule] = useState<any | null>(null)
  const [state, setState] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [authRequired, setAuthRequired] = useState(false)
  const [showSync, setShowSync] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [totalXp, setTotalXp] = useState<number | null>(null)
  const [progressSaveError, setProgressSaveError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      const lessonData = getLessonBySlug(slug)
      if (!lessonData) {
        if (active) setError('Lesson not found')
        return
      }
      const moduleData = await getLearningModuleByLessonSlug(slug)
      const session = await getSession()
      if (active) {
        setLesson(lessonData)
        setModule(moduleData)
        setState(initLessonPlayer(lessonData))
      }
      if (moduleData && session?.userId) {
        try {
          const existing = await getUserProgressForModule(moduleData.id)
          const progress =
            existing ||
            (await startModuleProgress({
              moduleId: moduleData.id,
              lessonSlug: lessonData.slug,
              totalSteps: lessonData.blocks.length,
            }))
          if (active) {
            setState(hydrateLessonPlayer(lessonData, progress))
          }
        } catch (e) {
          // ignore progress load errors
        } finally {
          if (active) setProgressLoaded(true)
        }
      } else if (moduleData && !session?.userId) {
        if (active) {
          setAuthRequired(true)
          setShowSync(true)
          setProgressLoaded(true)
        }
      } else {
        if (active) setProgressLoaded(true)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [slug])

  if (error) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <CustomText variant="body" style={styles.error}>{error}</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  // Route guard: mission execution requires auth (guest-first browsing is still supported elsewhere).
  if (authRequired) {
    return (
      <SpaceBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.center, { paddingHorizontal: spacing.xl }]}>
            <CustomText variant="body" style={styles.muted}>
              Initialize Identity to start this mission.
            </CustomText>
            <PixelButton
              label="SYNC COMMAND PROFILE"
              onPress={() => setShowSync(true)}
              style={{ marginTop: spacing.lg }}
            />
            <SyncIdentityModal
              open={showSync}
              onClose={() => setShowSync(false)}
              onSync={() => {
                setShowSync(false)
              }}
            />
          </View>
        </SafeAreaView>
      </SpaceBackground>
    )
  }

  if (!lesson || !state) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <CustomText variant="body" style={styles.muted}>Loading lesson…</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  const block = lesson.blocks[state.activeIndex]
  const value = state.answers[block.id]
  const validation = state.validation[block.id]

  const persistProgress = async (nextState: any) => {
    if (!module) return
    try {
      await saveModuleProgress({
        moduleId: module.id,
        lessonSlug: lesson.slug,
        currentStepIndex: nextState.activeIndex,
        totalSteps: lesson.blocks.length,
        answers: nextState.answers,
      })
      if (progressSaveError) setProgressSaveError(null)
    } catch (e) {
      const msg = (e as any)?.message || 'Failed to save progress'
      setProgressSaveError(msg)
    }
  }

  const handleAnswer = (val: any) => {
    setState((prev: any) => {
      const next = setAnswer(prev, block.id, val)
      if (progressLoaded) persistProgress(next)
      return next
    })
  }

  const handleNext = () => {
    setState((prev: any) => {
      const validated = validateCurrentBlock(lesson, prev)
      const next = goNext(lesson, validated)
      if (progressLoaded) persistProgress(next)
      return next
    })
  }

  const handlePrev = () => {
    setState((prev: any) => {
      const next = goPrev(prev)
      if (progressLoaded) persistProgress(next)
      return next
    })
  }

  const handleSubmit = async () => {
    const result = submitLesson(lesson, state)
    setState(result.nextState)
    if (result.nextState.submitState === 'success' && module) {
      const session = await getSession()
      try {
        if (session?.userId) {
          await submitModuleForUser({
            moduleId: module.id,
            lessonSlug: lesson.slug,
            answers: state.answers,
          })
          await completeModuleProgress(module.id)
          const xpResult = await awardXpForModuleCompletion({
            moduleId: module.id,
            xpReward: module.xpReward || 0,
          })
          if (xpResult?.xpAwarded) setXpEarned(module.xpReward || 0)
          if (typeof xpResult?.totalXp === 'number') setTotalXp(xpResult.totalXp)
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />

          <LessonHeader lesson={lesson} activeIndex={state.activeIndex} totalBlocks={state.totalBlocks} />

          {progressSaveError ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.md }}>
              <CustomText variant="bodySmall" style={styles.warningTitle}>Progress sync issue</CustomText>
              <CustomText variant="bodySmall" style={styles.warningText}>
                {progressSaveError}. Your answers are still kept on this device for this session.
              </CustomText>
              <PixelButton
                label="RETRY SAVE"
                onPress={() => persistProgress(state)}
                style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
              />
            </GlassCard>
          ) : null}

          <GlassCard variant="secondary">
            <BlockRenderer block={block} value={value} onChange={handleAnswer} onCheckpoint={handleAnswer} />
            {validation && !validation.valid ? (
              <CustomText variant="bodySmall" style={styles.validation}>{validation.message}</CustomText>
            ) : null}
          </GlassCard>

          <View style={styles.navRow}>
            <PixelButton label="BACK" onPress={handlePrev} disabled={state.activeIndex === 0} />
            {state.activeIndex < lesson.blocks.length - 1 ? (
              <PixelButton label="CONTINUE" onPress={handleNext} />
            ) : (
              <PixelButton label="SUBMIT" onPress={handleSubmit} />
            )}
          </View>

          {state.submitState === 'success' ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.success}>Mission Complete</CustomText>
              {xpEarned ? (
                <CustomText variant="bodySmall" style={styles.success}>+{xpEarned} XP Earned</CustomText>
              ) : null}
              {typeof totalXp === 'number' ? (
                <CustomText variant="bodySmall" style={styles.success}>Total XP: {totalXp}</CustomText>
              ) : null}
              <PixelButton
                label="RETURN HOME"
                onPress={() => {
                  // Reliable cross-navigator return-to-home: reset to the tab navigator and select Home.
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'AppTabs',
                          state: {
                            index: 0,
                            routes: [{ name: ROUTE_MANIFEST.HOME }],
                          },
                        },
                      ],
                    })
                  )
                }}
                style={{ marginTop: spacing.lg, alignSelf: 'flex-start' }}
              />
            </GlassCard>
          ) : null}

          {state.submitState === 'error' ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.error}>{state.submitError}</CustomText>
            </GlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  muted: { color: colors.muted },
  error: { color: '#f87171' },
  success: { color: '#4ade80' },
  warningTitle: { color: 'rgba(255, 221, 150, 0.95)', marginBottom: 4 },
  warningText: { color: 'rgba(255, 221, 150, 0.8)' },
  validation: { color: '#f87171', marginTop: spacing.sm },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
})
