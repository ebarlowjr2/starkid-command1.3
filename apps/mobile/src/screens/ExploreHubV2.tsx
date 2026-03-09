import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ImageBackground } from "react-native";
import { GlassCard } from "../components/home/GlassCard";
import { Badge } from "../components/home/Badge";
import { ExploreTile } from "../components/explore/ExploreTile";
import { ExploreHero } from "../components/explore/ExploreHero";
import { ROUTE_MANIFEST } from "@starkid/core";
import { colors, spacing, typography } from "../theme/tokens";
import { LinearGradient } from "expo-linear-gradient";

export default function ExploreHubV2({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../../assets/backgrounds/starkid-explore-hero.png")}
      style={styles.screenBackground}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(4,8,20,0.20)",
          "rgba(4,8,20,0.55)",
          "rgba(4,8,20,0.88)",
        ]}
        style={styles.screenGradient}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.scanlines} pointerEvents="none" />
          <ExploreHero />

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <View style={styles.badgeRow}>
              <Badge label="CONSOLES" />
              <Text style={styles.badgeHelper}>Pick a station to jump into</Text>
            </View>
          </GlassCard>

          <View style={{ marginTop: spacing.lg }}>
            <ExploreTile
              icon="🛰️"
              title="Command Center"
              subtitle="Live mission alerts and briefings."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.COMMAND_CENTER)}
            />
            <ExploreTile
              icon="🚀"
              title="Launches"
              subtitle="Upcoming rockets and mission timelines."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.LAUNCHES)}
            />
            <ExploreTile
              icon="🌙"
              title="Sky Events"
              subtitle="Eclipses, alignments, and meteor showers."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.SKY_EVENTS)}
            />
            <ExploreTile
              icon="☄️"
              title="Comets"
              subtitle="Track comets and observational windows."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.COMETS)}
            />
            <ExploreTile
              icon="🪐"
              title="Solar Map"
              subtitle="Solar activity and monitoring tools."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.SOLAR_MAP)}
            />
            <ExploreTile
              icon="📡"
              title="Streams"
              subtitle="Live feeds and mission streams."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STREAMS)}
            />
            <ExploreTile
              icon="🪐"
              title="Visit Another Planet"
              subtitle="Planetary command centers and destinations."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.PLANETS)}
            />
            <ExploreTile
              icon="✨"
              title="Beyond Our Solar System"
              subtitle="Exoplanet discovery console."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.BEYOND)}
            />
            <ExploreTile
              icon="🧪"
              title="STEM Activities"
              subtitle="Hands-on challenges and mini-labs (coming soon)."
              onPress={() => navigation?.navigate?.(ROUTE_MANIFEST.STEM_ACTIVITIES)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  screenBackground: { flex: 1 },
  screenGradient: { ...StyleSheet.absoluteFillObject },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  badgeHelper: { ...typography.pixel, color: colors.dim, flex: 1 },
  scanlines: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
});
