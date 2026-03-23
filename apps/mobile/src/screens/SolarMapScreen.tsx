import React from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

export default function SolarMapScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <CustomText variant="sectionLabel" style={styles.kicker}>SOLAR MAP</CustomText>
          <CustomText variant="hero" style={styles.title}>Solar Activity</CustomText>
          <CustomText variant="body" style={styles.subtitle}>
            Advanced solar visualizations are available on web for now.
          </CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="body" style={styles.cardText}>
              We’re optimizing the solar map experience for mobile devices.
            </CustomText>
          </GlassCard>
        </View>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  cardText: { color: colors.muted },
})
