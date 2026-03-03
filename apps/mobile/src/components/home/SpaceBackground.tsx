import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { View as RNView } from "react-native";
import { colors } from "../../theme/tokens";

/**
 * SpaceBackground: layered gradient + starfield.
 * Requires: expo-linear-gradient
 */
let LinearGradient: any = RNView;
try {
  // Optional dependency: use if available.
  LinearGradient = require("expo-linear-gradient").LinearGradient;
} catch (error) {
  LinearGradient = RNView;
}

const Gradient = (props: any) => {
  if (LinearGradient === RNView) {
    return <RNView style={props.style} />;
  }
  return <LinearGradient {...props} />;
};

export const SpaceBackground = memo(function SpaceBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <Gradient
        colors={[colors.bg0, "#0B0F2A", "#1A0F2F", "#03040B"]}
        start={{ x: 0.1, y: 0.0 }}
        end={{ x: 0.8, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />
      <Gradient
        colors={["rgba(61,235,255,0.12)", "rgba(255,79,216,0.06)", "transparent"]}
        start={{ x: 0.0, y: 0.2 }}
        end={{ x: 1.0, y: 0.9 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
      />
      <Starfield />
      {children}
    </View>
  );
});

const Starfield = memo(function Starfield() {
  // Lightweight static starfield.
  const stars: Array<[number, number, number]> = [
    [24, 76, 2],[66, 120, 1],[120, 44, 2],[160, 220, 1],[210, 90, 1],
    [44, 280, 1],[120, 310, 2],[260, 150, 1],[300, 60, 2],[320, 210, 1],
    [16, 420, 2],[80, 520, 1],[220, 480, 2],[320, 430, 1],[280, 560, 1],
    [36, 640, 1],[150, 690, 2],[290, 720, 1],
    [44, 820, 2],[120, 860, 1],[240, 900, 2],[300, 980, 1],
  ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map(([x, y, s], idx) => (
        <View
          key={idx}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: s,
            height: s,
            borderRadius: 99,
            backgroundColor: "rgba(234,242,255,0.8)",
            opacity: s === 2 ? 0.9 : 0.6,
          }}
        />
      ))}
      <View style={styles.glowCyan} />
      <View style={styles.glowMagenta} />
      <View style={styles.glowBottom} />
    </View>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
  glowCyan: {
    position: "absolute",
    left: -60,
    top: 220,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(61,235,255,0.10)",
  },
  glowMagenta: {
    position: "absolute",
    right: -80,
    top: 40,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(255,79,216,0.08)",
  },
  glowBottom: {
    position: "absolute",
    left: -80,
    bottom: -120,
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: "rgba(61,235,255,0.08)",
  },
});
