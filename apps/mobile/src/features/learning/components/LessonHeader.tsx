import React from 'react'
import { View, StyleSheet } from 'react-native'
import { CustomText } from '../../../components/ui/CustomText'
import { colors, spacing } from '../../../theme/tokens'
import type { Lesson } from '@starkid/core'

export default function LessonHeader({ lesson, activeIndex, totalBlocks }: { lesson: Lesson; activeIndex: number; totalBlocks: number }) {
  return (
    <View style={styles.container}>
      <CustomText variant="sectionLabel" style={styles.kicker}>
        LESSON • {lesson.difficulty.toUpperCase()} • {lesson.estimatedMinutes} MIN
      </CustomText>
      <CustomText variant="hero" style={styles.title}>{lesson.title}</CustomText>
      <CustomText variant="body" style={styles.subtitle}>{lesson.subtitle}</CustomText>
      <CustomText variant="bodySmall" style={styles.progress}>STEP {activeIndex + 1} OF {totalBlocks}</CustomText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  kicker: { color: colors.dim, marginBottom: spacing.xs },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: spacing.xs },
  progress: { color: colors.dim, marginTop: spacing.sm },
})
