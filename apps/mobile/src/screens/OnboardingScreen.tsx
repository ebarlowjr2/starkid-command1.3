import React, { useMemo, useState } from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { CustomText } from '../components/ui/CustomText'
import { colors, spacing } from '../theme/tokens'
import { Linking, Pressable } from 'react-native'

const SCREENS = [
  {
    title: 'Welcome to StarKid Command',
    body:
      'Explore space missions, science events, and interactive STEM activities through a command-center style experience.',
  },
  {
    title: 'Learn Through Missions',
    body:
      'Access mission briefings, solve guided challenges, submit your work, and track your learning progress.',
  },
  {
    title: 'Earn Progress',
    body:
      'Sign in to save progress, resume missions, earn XP, and grow your StarKid profile over time.',
  },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const screen = useMemo(() => SCREENS[Math.min(step, SCREENS.length - 1)], [step])
  const isLast = step >= SCREENS.length - 1

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <CustomText variant="sectionLabel" style={styles.kicker}>
              ONBOARDING {step + 1}/{SCREENS.length}
            </CustomText>
            <PixelButton label="SKIP" onPress={onDone} style={styles.skipBtn} />
          </View>

          <GlassCard variant="secondary" style={styles.card}>
            <CustomText variant="title" style={styles.title}>
              {screen.title}
            </CustomText>
            <CustomText variant="body" style={styles.body}>
              {screen.body}
            </CustomText>

            <View style={styles.dots}>
              {SCREENS.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === step ? styles.dotActive : styles.dotIdle]}
                />
              ))}
            </View>

            <PixelButton
              label={isLast ? 'START EXPLORING' : 'CONTINUE'}
              onPress={() => {
                if (!isLast) setStep((s) => Math.min(s + 1, SCREENS.length - 1))
                else onDone()
              }}
              style={styles.cta}
            />

            <View style={styles.legalRow}>
              {[
                ['Privacy', 'https://starkidcommand.com/privacy'],
                ['Terms', 'https://starkidcommand.com/terms'],
              ].map(([label, url]) => (
                <Pressable key={label} onPress={() => Linking.openURL(url)} style={styles.legalLink}>
                  <CustomText variant="bodySmall" style={styles.legalText}>{label}</CustomText>
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  kicker: { color: colors.dim },
  card: { padding: spacing.xl },
  title: { color: colors.text },
  body: { color: colors.muted, marginTop: spacing.md, lineHeight: 22 },
  dots: { flexDirection: 'row', gap: 8, marginTop: spacing.lg, marginBottom: spacing.lg },
  dot: { width: 10, height: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(61,235,255,0.35)' },
  dotActive: { backgroundColor: 'rgba(61,235,255,0.85)' },
  dotIdle: { backgroundColor: 'rgba(61,235,255,0.10)' },
  cta: { alignSelf: 'flex-start' },
  skipBtn: { alignSelf: 'flex-end', paddingHorizontal: 10, paddingVertical: 6 },
  legalRow: { flexDirection: 'row', gap: 12, marginTop: spacing.md },
  legalLink: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(61,235,255,0.25)' },
  legalText: { color: colors.dim },
})
