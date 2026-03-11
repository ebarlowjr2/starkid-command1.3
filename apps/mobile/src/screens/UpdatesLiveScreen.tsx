import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { ROUTE_MANIFEST } from '@starkid/core'
import { colors, spacing, typography } from '../theme/tokens'

export default function UpdatesLiveScreen({ navigation }: any) {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>UPDATES</Text>
          <Text style={styles.title}>Live Streams</Text>
          <Text style={styles.subtitle}>Launch feeds and mission broadcasts.</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.body}>Open the live streams console.</Text>
            <PixelButton
              label="OPEN STREAMS →"
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STREAMS)}
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
            />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  body: { ...typography.body, color: colors.muted },
})
