import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassCard } from "./GlassCard";
import { PixelButton } from "./PixelButton";
import { colors, spacing, typography } from "../../theme/tokens";

export const HeroPanel = memo(function HeroPanel({ onExplore }: { onExplore?: () => void }) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.kicker}>WELCOME TO</Text>
      <Text style={styles.title}>STARKID COMMAND</Text>
      <Text style={styles.sub}>Junior Science Officer Control Network</Text>
      <Text style={styles.body}>
        StarKid Command is a live mission-control interface for tracking, understanding, and exploring space.
      </Text>

      <PixelButton label="EXPLORE →" onPress={onExplore} style={{ marginTop: spacing.md }} />

      <View style={styles.statsRow}>
        <StatChip label="SYSTEMS" value="ONLINE" tint="cyan" />
        <StatChip label="MISSIONS" value="8 ACTIVE" tint="magenta" />
        <StatChip label="DATA" value="LIVE" tint="cyan" />
      </View>

      {/* Sticker placeholders (swap to PNG assets later) */}
      <View pointerEvents="none" style={styles.planet} />
      <View pointerEvents="none" style={styles.ufo} />
      <View pointerEvents="none" style={styles.robot} />
    </GlassCard>
  );
});

function StatChip({ label, value, tint }: { label: string; value: string; tint: "cyan" | "magenta" }) {
  const c = tint === "cyan" ? colors.cyan : colors.magenta;
  return (
    <View style={[styles.chip, { borderColor: `${c}55` }]}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, { color: c }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  title: { ...typography.hero, color: colors.text },
  sub: { ...typography.small, color: colors.muted, marginTop: 6 },
  body: { ...typography.body, color: colors.muted, marginTop: 10, maxWidth: 340 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: spacing.lg },
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(5, 8, 18, 0.35)",
  },
  chipLabel: { ...typography.pixel, color: colors.dim, marginBottom: 4 },
  chipValue: { ...typography.small, color: colors.cyan },
  planet: {
    position: "absolute",
    right: -18,
    top: -22,
    width: 78,
    height: 78,
    borderRadius: 78,
    backgroundColor: "rgba(61,235,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.25)",
  },
  ufo: {
    position: "absolute",
    right: 42,
    top: 18,
    width: 34,
    height: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255,79,216,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,79,216,0.32)",
    transform: [{ rotate: "10deg" }],
  },
  robot: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "rgba(234,242,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(234,242,255,0.22)",
  },
});
