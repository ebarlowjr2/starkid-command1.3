import React, { memo } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { GlassCard } from "../home/GlassCard";
import { colors, spacing, typography } from "../../theme/tokens";

export const ExploreTile = memo(function ExploreTile({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.96 },
      ]}
    >
      <GlassCard variant="secondary" style={styles.card}>
        <View style={styles.glowStrip} />
        <View style={styles.row}>
          <View style={styles.iconRing}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: { marginBottom: spacing.md },
  card: { padding: 14 },
  glowStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: "rgba(61,235,255,0.35)",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(61,235,255,0.5)",
    backgroundColor: "rgba(6, 10, 22, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18 },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 4 },
  chevron: { ...typography.pixel, color: colors.cyan },
});
