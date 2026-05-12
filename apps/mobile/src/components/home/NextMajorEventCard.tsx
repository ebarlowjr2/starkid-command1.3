import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./GlassCard";
import { PixelButton } from "./PixelButton";
import { colors, spacing } from "../../theme/tokens";
import { CustomText } from "../ui/CustomText";

export const NextMajorEventCard = memo(function NextMajorEventCard({
  kicker = "NEXT MAJOR EVENT",
  title,
  netLine,
  countdown,
  onOpenBrief,
  description,
  buttonLabel = "OPEN BRIEF →",
}: {
  kicker?: string;
  title: string;
  netLine?: string;
  countdown?: string;
  onOpenBrief?: () => void;
  description?: string;
  buttonLabel?: string;
}) {
  return (
    <GlassCard style={{ marginBottom: spacing.lg }} variant="primary">
      <CustomText variant="sectionLabel" style={styles.kicker}>{kicker}</CustomText>
      <CustomText variant="cardTitle" style={styles.title} numberOfLines={2}>
        {title}
      </CustomText>
      {netLine ? <CustomText variant="bodySmall" style={styles.net}>{netLine}</CustomText> : null}

      <CustomText variant="sectionLabel" style={styles.countdownLabel}>COUNTDOWN</CustomText>
      <CustomText variant="title" style={styles.countdown}>
        {countdown ?? "--:--:--"}
      </CustomText>

      <PixelButton label={buttonLabel} onPress={onOpenBrief} style={{ marginTop: spacing.md, alignSelf: "center" }} />

      {description ? (
        <CustomText variant="body" style={styles.desc} numberOfLines={2}>
          {description}
        </CustomText>
      ) : null}

      <View pointerEvents="none" style={styles.orb} />
      <View pointerEvents="none" style={styles.orbGlow} />
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text, marginLeft: 92 },
  net: { color: colors.muted, marginTop: 8, marginLeft: 92 },
  countdownLabel: { color: colors.dim, marginTop: spacing.md, marginLeft: 92 },
  countdown: { color: colors.cyan, letterSpacing: 1.2, marginTop: 4, marginLeft: 92 },
  desc: { color: colors.muted, marginTop: spacing.md },
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
