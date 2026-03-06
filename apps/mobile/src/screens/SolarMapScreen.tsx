import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'

export default function SolarMapScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>SOLAR MAP</Text>
          <Text style={styles.title}>Solar Activity</Text>
          <Text style={styles.subtitle}>
            Advanced solar visualizations are available on web for now.
          </Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.cardText}>
              We’re optimizing the solar map experience for mobile devices.
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
