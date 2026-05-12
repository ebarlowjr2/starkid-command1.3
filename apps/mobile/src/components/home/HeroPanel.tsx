import React, { memo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { GlassCard } from "./GlassCard";
import { PixelButton } from "./PixelButton";
import { colors, spacing, typography } from "../../theme/tokens";

export const HeroPanel = memo(function HeroPanel({ onExplore }: { onExplore?: () => void }) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.kicker}>WELCOME TO</Text>
      <Text style={styles.title}>
        <Text style={styles.titleAccent}>STARKID</Text> COMMAND
      </Text>
      <Text style={styles.sub}>Junior Science Officer Control Network</Text>
      <Text style={styles.body}>
        StarKid Command is a live mission-control interface for tracking, understanding, and exploring space.
      </Text>

      <PixelButton label="EXPLORE →" onPress={onExplore} style={{ marginTop: spacing.md, alignSelf: "center" }} />

      <View style={styles.statsRow}>
        <StatChip label="SYSTEMS" value="ONLINE" tint="cyan" />
        <StatChip label="MISSIONS" value="8 ACTIVE" tint="magenta" />
        <StatChip label="DATA" value="LIVE" tint="cyan" />
      </View>

      {/* Sticker assets */}
      <Image source={require("../../../assets/ui/stickers/planet.png")} style={styles.planet} />
      <Image source={require("../../../assets/ui/stickers/ufo.png")} style={styles.ufo} />
      <Image source={require("../../../assets/ui/stickers/robot.png")} style={styles.robot} />
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
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 6, textAlign: "center" },
  title: { ...typography.hero, color: colors.text, textAlign: "center" },
  titleAccent: { color: colors.cyan },
  sub: { ...typography.small, color: colors.muted, marginTop: 6, textAlign: "center" },
  body: { ...typography.body, color: colors.muted, marginTop: 10, textAlign: "center", alignSelf: "center", maxWidth: 320 },
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
    left: -10,
    top: -12,
    width: 96,
    height: 96,
  },
  ufo: {
    position: "absolute",
    right: 10,
    top: 4,
    width: 70,
    height: 46,
  },
  robot: {
    position: "absolute",
    right: 12,
    bottom: 10,
    width: 44,
    height: 44,
  },
});
