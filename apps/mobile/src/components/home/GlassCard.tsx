import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, radii } from "../../theme/tokens";

export const GlassCard = memo(function GlassCard({
  children,
  style,
  variant = "primary",
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
}) {
  return (
    <View style={[styles.outer, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: "rgba(61,235,255,0.55)",
    backgroundColor: "rgba(6, 10, 22, 0.55)",
    shadowColor: "#2be4ff",
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: "hidden",
  },
  inner: { borderRadius: radii.card, backgroundColor: "rgba(10, 18, 40, 0.78)", padding: 16 },
});
