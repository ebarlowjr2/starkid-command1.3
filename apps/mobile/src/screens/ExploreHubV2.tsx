import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { Badge } from "../components/home/Badge";
import { ExploreTile } from "../components/explore/ExploreTile";
import { ROUTE_MANIFEST } from "@starkid/core";
import { colors, spacing, typography } from "../theme/tokens";

export default function ExploreHubV2({ navigation }: any) {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.scanlines} pointerEvents="none" />
          <Text style={styles.kicker}>EXPLORE HUB</Text>
          <Text style={styles.helper}>Choose a console to jump into and start tracking missions.</Text>

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
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  helper: { ...typography.body, color: colors.muted },
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
