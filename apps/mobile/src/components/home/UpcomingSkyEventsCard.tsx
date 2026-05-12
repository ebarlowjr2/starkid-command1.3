import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";
import { colors, spacing } from "../../theme/tokens";
import { CustomText } from "../ui/CustomText";

export const UpcomingSkyEventsCard = memo(function UpcomingSkyEventsCard({
  events,
}: {
  events: Array<{ title: string; when: string }>;
}) {
  return (
    <GlassCard variant="secondary">
      <View style={styles.header}>
        <Badge label="UPCOMING" />
        <CustomText variant="sectionLabel" style={styles.headerText}>
          SKY EVENTS IN THE NEXT 30 DAYS
        </CustomText>
      </View>

      <View style={{ marginTop: spacing.md, gap: 10 }}>
        {events.slice(0, 4).map((e, idx) => (
          <View key={idx} style={styles.row}>
            <View style={styles.rowGlow} />
            <View style={styles.rowInner}>
              <CustomText variant="cardTitle" style={styles.rowTitle} numberOfLines={2}>
                {e.title}
              </CustomText>
              <CustomText variant="bodySmall" style={styles.rowWhen}>
                {e.when}
              </CustomText>
            </View>
          </View>
        ))}
        {events.length === 0 ? (
          <CustomText variant="body" style={{ color: colors.muted }}>
            No sky events found in the next 30 days.
          </CustomText>
        ) : null}
      </View>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { color: colors.dim, flex: 1 },
  row: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,79,216,0.35)",
    backgroundColor: "rgba(18, 12, 38, 0.6)",
  },
  rowGlow: {
    position: "absolute",
    left: -10,
    top: -20,
    width: 90,
    height: 90,
    borderRadius: 90,
    backgroundColor: "rgba(255,79,216,0.2)",
  },
  rowInner: { paddingVertical: 14, paddingHorizontal: 14 },
  rowTitle: { color: "#FFD1F3" },
  rowWhen: { color: colors.muted, marginTop: 4 },
});
