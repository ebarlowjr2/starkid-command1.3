import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme/tokens";

export function CometTabButton({ onPress, focused }: { onPress?: () => void; focused?: boolean }) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { transform: [{ scale: 0.96 }] }]}>
        <Text style={styles.icon}>✨</Text>
      </Pressable>
      <Text style={[styles.label, focused && styles.labelActive]}>C.O.M.E.T.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", marginTop: -24 },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(6, 10, 22, 0.85)",
    borderWidth: 2,
    borderColor: "rgba(61,235,255,0.8)",
    shadowColor: "#FF4FD8",
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  icon: { fontSize: 24, color: colors.text },
  label: { ...typography.pixel, color: colors.dim, marginTop: 6 },
  labelActive: { color: colors.text },
});
