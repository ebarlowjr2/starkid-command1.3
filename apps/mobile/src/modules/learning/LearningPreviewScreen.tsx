import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { SpaceBackground } from '../../components/home/SpaceBackground'
import { GlassCard } from '../../components/home/GlassCard'
import { CustomText } from '../../components/ui/CustomText'
import { colors, spacing } from '../../theme/tokens'
import { listLessons } from '@starkid/core'

export default function LearningPreviewScreen() {
  const lessons = listLessons()
  const lesson = lessons[0]

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>LEARNING PREVIEW (DEV)</CustomText>
          <CustomText variant="hero" style={styles.title}>Lesson Seed</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Loaded from core learning service.</CustomText>

          {lesson ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="cardTitle" style={styles.cardTitle}>{lesson.title}</CustomText>
              <CustomText variant="bodySmall" style={styles.meta}>{lesson.subtitle}</CustomText>
              <CustomText variant="bodySmall" style={styles.meta}>Blocks: {lesson.blocks.length}</CustomText>
              <View style={{ marginTop: spacing.sm }}>
                {lesson.blocks.map((block) => (
                  <CustomText key={block.id} variant="bodySmall" style={styles.blockRow}>
                    {block.order}. {block.type}
                  </CustomText>
                ))}
              </View>
            </GlassCard>
          ) : (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.meta}>No lessons found.</CustomText>
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  cardTitle: { color: colors.text },
  meta: { color: colors.dim, marginTop: 6 },
  blockRow: { color: colors.muted, marginTop: 4 },
})
