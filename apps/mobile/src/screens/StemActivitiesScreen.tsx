import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'

export default function StemActivitiesScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>STEM ACTIVITIES</Text>
          <Text style={styles.title}>Coming Soon</Text>
          <Text style={styles.subtitle}>
            Hands-on challenges and mini-labs tied to live mission data are on the way.
          </Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.cardText}>
              We’re building lesson-ready activities for classrooms and self-guided missions.
            </Text>
          </GlassCard>
        </View>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  cardText: { ...typography.body, color: colors.muted },
})
