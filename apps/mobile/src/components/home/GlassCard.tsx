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
    <View style={[styles.outer, variant === "secondary" && styles.outer2, style]}>
      <View style={[styles.inner, variant === "secondary" && styles.inner2]}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(8, 12, 24, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    overflow: "hidden",
  },
  outer2: { borderColor: colors.stroke2 },
  inner: { borderRadius: radii.card, backgroundColor: colors.panel, padding: 16 },
  inner2: { backgroundColor: colors.panel2 },
});
