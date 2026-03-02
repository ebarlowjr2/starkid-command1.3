import React, { memo } from "react";
import { Text, StyleSheet } from "react-native";
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

      <PixelButton label="OPEN BRIEF →" onPress={onOpenBrief} style={{ marginTop: spacing.md }} />

      {description ? (
        <Text style={styles.desc} numberOfLines={2}>{description}</Text>
      ) : null}
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.h2, color: colors.text },
  net: { ...typography.small, color: colors.muted, marginTop: 8 },
  countdownLabel: { ...typography.pixel, color: colors.dim, marginTop: spacing.md },
  countdown: { fontSize: 30, lineHeight: 34, fontWeight: "900", color: colors.cyan, letterSpacing: 1.2, marginTop: 4 },
  desc: { ...typography.body, color: colors.muted, marginTop: spacing.md },
});
