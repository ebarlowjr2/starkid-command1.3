import React from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

export default function StreamsScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <CustomText variant="sectionLabel" style={styles.kicker}>STREAMS</CustomText>
          <CustomText variant="hero" style={styles.title}>Live Streams</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Mission broadcasts and live feeds are coming soon.</CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="body" style={styles.cardText}>
              We’re integrating launch control rooms, telescope feeds, and live events.
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
