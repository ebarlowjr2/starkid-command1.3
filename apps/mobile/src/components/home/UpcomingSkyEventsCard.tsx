import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";
import { colors, spacing, typography } from "../../theme/tokens";

export const UpcomingSkyEventsCard = memo(function UpcomingSkyEventsCard({
  events,
}: {
  events: Array<{ title: string; when: string }>;
}) {
  return (
    <GlassCard variant="secondary">
      <View style={styles.header}>
        <Badge label="UPCOMING" />
        <Text style={styles.headerText}>SKY EVENTS IN THE NEXT 30 DAYS</Text>
      </View>

      <View style={{ marginTop: spacing.md, gap: 10 }}>
        {events.slice(0, 4).map((e, idx) => (
          <View key={idx} style={styles.row}>
            <View style={styles.rowGlow} />
            <View style={styles.rowInner}>
              <Text style={styles.rowTitle} numberOfLines={2}>{e.title}</Text>
              <Text style={styles.rowWhen}>{e.when}</Text>
            </View>
          </View>
        ))}
        {events.length === 0 ? (
          <Text style={{ ...typography.body, color: colors.muted }}>No sky events found in the next 30 days.</Text>
        ) : null}
      </View>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { ...typography.pixel, color: colors.dim, flex: 1 },
  row: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,79,216,0.22)",
    backgroundColor: "rgba(8, 10, 24, 0.30)",
  },
  rowGlow: {
    position: "absolute",
    left: -20,
    top: -10,
    width: 80,
    height: 80,
    borderRadius: 80,
    backgroundColor: "rgba(255,79,216,0.14)",
  },
  rowInner: { paddingVertical: 12, paddingHorizontal: 12 },
  rowTitle: { ...typography.h2, fontSize: 16, lineHeight: 20, color: colors.text },
  rowWhen: { ...typography.small, color: colors.muted, marginTop: 4 },
});
