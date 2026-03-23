import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { colors, radii } from "../../theme/tokens";
import { CustomText } from "../ui/CustomText";

export const Badge = memo(function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <CustomText variant="sectionLabel" style={styles.text}>{label}</CustomText>
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
  text: { color: colors.text },
});
