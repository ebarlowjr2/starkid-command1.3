import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SpaceBackground } from "../../components/home/SpaceBackground";
import { GlassCard } from "../../components/home/GlassCard";
import { colors, spacing, typography } from "../../theme/tokens";

export default function CyberLabScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>CYBER LAB</Text>
          <Text style={styles.title}>Cybersecurity Training Environment</Text>
          <Text style={styles.subtitle}>
            Interactive cybersecurity training inspired by real space mission systems.
          </Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.cardTitle}>Coming Soon</Text>
            <Text style={styles.cardBody}>
              This page will connect to cyber challenges, incident response labs, and log analysis drills.
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  cardTitle: { ...typography.h3, color: colors.accent, marginBottom: 6 },
  cardBody: { ...typography.body, color: colors.muted },
});
