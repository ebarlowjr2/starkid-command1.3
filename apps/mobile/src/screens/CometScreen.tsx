import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { colors, spacing } from "../theme/tokens";
import { CustomText } from "../components/ui/CustomText";

export default function CometScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <CustomText variant="sectionLabel" style={styles.kicker}>C.O.M.E.T.</CustomText>
          <CustomText variant="hero" style={styles.title}>Command Orb Assistant</CustomText>
          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="body" style={styles.body}>Assistant interface coming soon.</CustomText>
          </GlassCard>
        </View>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  body: { color: colors.muted },
});
