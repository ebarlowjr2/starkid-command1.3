import React, { memo } from "react";
import { Pressable, StyleSheet, ViewStyle, View } from "react-native";
import { colors } from "../../theme/tokens";
import { CustomText } from "../ui/CustomText";

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
      <View style={[styles.inner, { borderColor: glow }]}>
        <View style={[styles.corner, styles.cornerTl, { backgroundColor: glow }]} />
        <View style={[styles.corner, styles.cornerTr, { backgroundColor: glow }]} />
        <View style={[styles.corner, styles.cornerBl, { backgroundColor: glow }]} />
        <View style={[styles.corner, styles.cornerBr, { backgroundColor: glow }]} />
        <CustomText variant="button" style={styles.text}>
          {label}
        </CustomText>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: "rgba(6, 10, 22, 0.65)",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  inner: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 10, 22, 0.45)",
  },
  corner: {
    position: "absolute",
    width: 6,
    height: 6,
  },
  cornerTl: { left: -2, top: -2 },
  cornerTr: { right: -2, top: -2 },
  cornerBl: { left: -2, bottom: -2 },
  cornerBr: { right: -2, bottom: -2 },
  text: {
    color: colors.text,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
