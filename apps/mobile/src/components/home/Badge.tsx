import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, typography } from "../../theme/tokens";

export const Badge = memo(function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255,79,216,0.35)",
    backgroundColor: "rgba(255,79,216,0.10)",
  },
  text: { color: colors.text, ...typography.pixel },
});
