import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { getLessonBySlug } from '@starkid/core'
import { initLessonPlayer, setAnswer, validateCurrentBlock, goNext, goPrev, submitLesson } from '@starkid/core'
import { SpaceBackground } from '../../../components/home/SpaceBackground'
import { GlassCard } from '../../../components/home/GlassCard'
import { PixelButton } from '../../../components/home/PixelButton'
import { colors, spacing } from '../../../theme/tokens'
import { CustomText } from '../../../components/ui/CustomText'
import LessonHeader from '../components/LessonHeader'
import BlockRenderer from '../components/BlockRenderer'

export default function LessonPlayerScreen({ route, navigation }: any) {
  const slug = route?.params?.slug
  const [lesson, setLesson] = useState<any | null>(null)
  const [state, setState] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const lessonData = getLessonBySlug(slug)
    if (!lessonData) {
      setError('Lesson not found')
      return
    }
    setLesson(lessonData)
    setState(initLessonPlayer(lessonData))
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

  const handleAnswer = (val: any) => {
    setState((prev: any) => setAnswer(prev, block.id, val))
  }

  const handleNext = () => {
    setState((prev: any) => validateCurrentBlock(lesson, prev))
    setState((prev: any) => goNext(lesson, prev))
  }

  const handlePrev = () => setState((prev: any) => goPrev(prev))

  const handleSubmit = () => {
    const result = submitLesson(lesson, state)
    setState(result.nextState)
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start' }} />

          <LessonHeader lesson={lesson} activeIndex={state.activeIndex} totalBlocks={state.totalBlocks} />

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
              <PixelButton label="SUBMIT TO COMMAND" onPress={handleSubmit} />
            )}
          </View>

          {state.submitState === 'success' ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.success}>Submission received. Command review will follow.</CustomText>
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
  validation: { color: '#f87171', marginTop: spacing.sm },
  navRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
})
