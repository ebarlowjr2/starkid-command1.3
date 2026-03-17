import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { colors, spacing, typography } from "../theme/tokens";
import { getArtemisProgramSummary } from "@starkid/core";

export default function ArtemisScreen() {
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const result = await getArtemisProgramSummary();
      if (active) setSummary(result.data || null);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>ARTEMIS PROGRAM</Text>
          <Text style={styles.title}>NASA Lunar Exploration</Text>
          <Text style={styles.subtitle}>Priority lunar program tracking and milestones.</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.cardTitle}>{summary?.programName || "Artemis"}</Text>
            <Text style={styles.cardBody}>
              {summary?.description || "Program summary coming soon."}
            </Text>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Next Major Event</Text>
            <Text style={styles.cardTitle}>{summary?.nextMission || "Artemis II"}</Text>
            <Text style={styles.cardBody}>
              {summary?.nextMissionDate ? `Target: ${new Date(summary.nextMissionDate).toLocaleDateString()}` : "Target date TBD"}
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
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.accent, marginBottom: 6 },
  cardBody: { ...typography.body, color: colors.muted },
});
