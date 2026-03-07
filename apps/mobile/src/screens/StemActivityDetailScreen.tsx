import React from 'react'
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { getStemActivityById } from '@starkid/core'

export default function StemActivityDetailScreen({ route }: { route: any }) {
  const { activityId } = route?.params || {}
  const activity = getStemActivityById(activityId)

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
})
