import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ROUTE_MANIFEST } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

export default function MissionsHubScreen() {
  const navigation = useNavigation<any>()

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>
            MISSIONS
          </CustomText>
          <CustomText variant="hero" style={styles.title}>
            Mission Control
          </CustomText>
          <CustomText variant="body" style={styles.subtitle}>
            Launch windows, mission alerts, Artemis status, and lunar events.
          </CustomText>

          <View style={{ marginTop: spacing.lg, gap: 12 }}>
            <GlassCard variant="secondary" style={styles.card}>
              <CustomText variant="cardTitle" style={styles.cardTitle}>
                Launches
              </CustomText>
              <CustomText variant="bodySmall" style={styles.cardBody}>
                Track upcoming launch windows and provider spotlights.
              </CustomText>
              <PixelButton
                label="OPEN LAUNCHES"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.LAUNCHES)}
                style={styles.cta}
              />
            </GlassCard>

            <GlassCard variant="secondary" style={styles.card}>
              <CustomText variant="cardTitle" style={styles.cardTitle}>
                Mission Alerts
              </CustomText>
              <CustomText variant="bodySmall" style={styles.cardBody}>
                Accept mission opportunities generated from real-world events.
              </CustomText>
              <PixelButton
                label="OPEN ALERTS"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.MISSION_ALERTS)}
                style={styles.cta}
              />
            </GlassCard>

            <GlassCard variant="secondary" style={styles.card}>
              <CustomText variant="cardTitle" style={styles.cardTitle}>
                Artemis
              </CustomText>
              <CustomText variant="bodySmall" style={styles.cardBody}>
                View Artemis mission overview, tracker, and countdown estimate.
              </CustomText>
              <PixelButton
                label="OPEN ARTEMIS"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.ARTEMIS)}
                style={styles.cta}
              />
            </GlassCard>

            <GlassCard variant="secondary" style={styles.card}>
              <CustomText variant="cardTitle" style={styles.cardTitle}>
                Lunar Events
              </CustomText>
              <CustomText variant="bodySmall" style={styles.cardBody}>
                Explore sky events and tonight’s mission planning.
              </CustomText>
              <PixelButton
                label="OPEN LUNAR EVENTS"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.SKY_EVENTS)}
                style={styles.cta}
              />
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 6 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  card: { padding: spacing.lg },
  cardTitle: { color: colors.text },
  cardBody: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  cta: { marginTop: spacing.md, alignSelf: 'flex-start' },
})

