import React, { memo } from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography } from "../../theme/tokens";

export const PixelButton = memo(function PixelButton({
  label,
  onPress,
  style,
  variant = "cyan",
}: {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "cyan" | "magenta";
}) {
  const glow = variant === "cyan" ? colors.cyan : colors.magenta;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { borderColor: glow, shadowColor: glow },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(6, 10, 22, 0.55)",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  text: { color: colors.text, ...typography.small, letterSpacing: 1.1, textTransform: "uppercase" },
});
