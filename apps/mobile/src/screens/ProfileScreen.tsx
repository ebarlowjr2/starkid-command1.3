import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { colors, spacing, typography } from "../theme/tokens";

export default function ProfileScreen() {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.kicker}>PROFILE</Text>
          <Text style={styles.title}>Commander Profile</Text>
          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.body}>Profile features coming soon.</Text>
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
