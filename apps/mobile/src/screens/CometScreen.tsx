import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { colors, spacing, typography } from "../theme/tokens";

export default function CometScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>C.O.M.E.T.</Text>
          <Text style={styles.title}>Command Orb Assistant</Text>
          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.body}>Assistant interface coming soon.</Text>
          </GlassCard>
        </View>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  body: { ...typography.body, color: colors.muted },
});
