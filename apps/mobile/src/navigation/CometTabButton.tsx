import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme/tokens";

export function CometTabButton({ onPress, focused }: { onPress?: () => void; focused?: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.arcLabel}>
        <Text style={[styles.arcLetter, styles.arcC, focused && styles.arcActive]}>C</Text>
        <Text style={[styles.arcLetter, styles.arcO, focused && styles.arcActive]}>O</Text>
        <Text style={[styles.arcLetter, styles.arcM, focused && styles.arcActive]}>M</Text>
        <Text style={[styles.arcLetter, styles.arcE, focused && styles.arcActive]}>E</Text>
        <Text style={[styles.arcLetter, styles.arcT, focused && styles.arcActive]}>T</Text>
      </View>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { transform: [{ scale: 0.96 }] }]}>
        <Text style={styles.icon}>✨</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", marginTop: -18 },
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
  arcLabel: {
    position: "absolute",
    top: -18,
    width: 90,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  arcLetter: {
    position: "absolute",
    ...typography.pixel,
    fontSize: 9,
    color: colors.dim,
  },
  arcActive: { color: colors.text },
  arcC: { left: 6, top: 18, transform: [{ rotate: "-28deg" }] },
  arcO: { left: 22, top: 8, transform: [{ rotate: "-14deg" }] },
  arcM: { left: 40, top: 4, transform: [{ rotate: "0deg" }] },
  arcE: { left: 58, top: 8, transform: [{ rotate: "14deg" }] },
  arcT: { left: 74, top: 18, transform: [{ rotate: "28deg" }] },
});
