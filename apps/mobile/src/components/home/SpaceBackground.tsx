import React, { memo } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
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
    <ImageBackground
      source={require("../../../assets/backgrounds/starkid-app-default.png")}
      style={styles.root}
      resizeMode="cover"
    >
      <Gradient
        colors={["rgba(4,8,20,0.15)", "rgba(4,8,20,0.35)", "rgba(4,8,20,0.6)"]}
        start={{ x: 0.1, y: 0.0 }}
        end={{ x: 0.8, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
});
