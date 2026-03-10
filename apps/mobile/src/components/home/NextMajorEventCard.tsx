import React, { memo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { GlassCard } from "./GlassCard";
import { PixelButton } from "./PixelButton";
import { colors, spacing, typography } from "../../theme/tokens";

export const NextMajorEventCard = memo(function NextMajorEventCard({
  title,
  netLine,
  countdown,
  onOpenBrief,
  description,
}: {
  title: string;
  netLine?: string;
  countdown?: string;
  onOpenBrief?: () => void;
  description?: string;
}) {
  return (
    <GlassCard style={{ marginBottom: spacing.lg }} variant="primary">
      <Text style={styles.kicker}>NEXT MAJOR EVENT</Text>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      {netLine ? <Text style={styles.net}>{netLine}</Text> : null}

      <Text style={styles.countdownLabel}>COUNTDOWN</Text>
      <Text style={styles.countdown}>{countdown ?? "--:--:--"}</Text>

      <PixelButton label="OPEN BRIEF →" onPress={onOpenBrief} style={{ marginTop: spacing.md, alignSelf: "center" }} />

      {description ? (
        <Text style={styles.desc} numberOfLines={2}>{description}</Text>
      ) : null}

      <View pointerEvents="none" style={styles.orb} />
      <View pointerEvents="none" style={styles.orbGlow} />
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.h2, color: colors.text, marginLeft: 92 },
  net: { ...typography.small, color: colors.muted, marginTop: 8, marginLeft: 92 },
  countdownLabel: { ...typography.pixel, color: colors.dim, marginTop: spacing.md, marginLeft: 92 },
  countdown: { fontSize: 30, lineHeight: 34, fontWeight: "900", color: colors.cyan, letterSpacing: 1.2, marginTop: 4, marginLeft: 92 },
  desc: { ...typography.body, color: colors.muted, marginTop: spacing.md },
  orb: {
    position: "absolute",
    left: 18,
    top: 46,
    width: 78,
    height: 78,
    borderRadius: 78,
    backgroundColor: "rgba(125, 211, 252, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.45)",
  },
  orbGlow: {
    position: "absolute",
    left: 6,
    top: 30,
    width: 110,
    height: 110,
    borderRadius: 110,
    backgroundColor: "rgba(61,235,255,0.12)",
  },
});
