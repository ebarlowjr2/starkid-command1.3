import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { HeroPanel } from "../components/home/HeroPanel";
import { NextMajorEventCard } from "../components/home/NextMajorEventCard";
import { UpcomingSkyEventsCard } from "../components/home/UpcomingSkyEventsCard";
import { spacing } from "../theme/tokens";

/**
 * HomeScreenV2: drop-in UI scaffold matching the "cartoon space + pixel flair" mock.
 * Wire `nextMajorEvent` and `upcomingSkyEvents` from your existing data sources (core/alerts).
 */
export default function HomeScreenV2({ navigation, nextMajorEvent, upcomingSkyEvents }: any) {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <HeroPanel onExplore={() => navigation?.navigate?.("CommandCenter")} />

          <NextMajorEventCard
            title={nextMajorEvent?.title ?? "—"}
            netLine={nextMajorEvent?.netLine ?? "Launch window opens (NET)"}
            countdown={nextMajorEvent?.countdown ?? "0d 00:00:00"}
            onOpenBrief={() => navigation?.navigate?.("MissionBriefing")}
            description={nextMajorEvent?.description ?? ""}
          />

          <UpcomingSkyEventsCard
            events={(upcomingSkyEvents ?? []).map((e: any) => ({ title: e.title ?? e.name, when: e.when ?? e.date ?? "" }))}
          />
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: 44,
    gap: spacing.lg,
  },
});
