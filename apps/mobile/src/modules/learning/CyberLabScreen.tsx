import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { SpaceBackground } from "../../components/home/SpaceBackground";
import { GlassCard } from "../../components/home/GlassCard";
import { colors, spacing } from "../../theme/tokens";
import { CustomText } from "../../components/ui/CustomText";

export default function CyberLabScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>CYBER LAB</CustomText>
          <CustomText variant="h2" style={styles.title}>Cybersecurity Training Environment</CustomText>
          <CustomText variant="body" style={styles.subtitle}>
            Interactive cybersecurity training inspired by real space mission systems.
          </CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="cardTitle" style={styles.cardTitle}>Coming Soon</CustomText>
            <CustomText variant="body" style={styles.cardBody}>
              This page will connect to cyber challenges, incident response labs, and log analysis drills.
            </CustomText>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  cardTitle: { color: colors.accent, marginBottom: 6 },
  cardBody: { color: colors.muted },
});
