import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getUpcomingSkyEventsService, getUpcomingLaunches, ROUTE_MANIFEST } from "@starkid/core";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { HeroPanel } from "../components/home/HeroPanel";
import { NextMajorEventCard } from "../components/home/NextMajorEventCard";
import { UpcomingSkyEventsCard } from "../components/home/UpcomingSkyEventsCard";
import { spacing } from "../theme/tokens";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [nextLaunch, setNextLaunch] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let active = true;
    async function load() {
      const [eventsResult, launchesResult] = await Promise.allSettled([
        getUpcomingSkyEventsService({ days: 30 }),
        getUpcomingLaunches({ limit: 10 }),
      ]);

      if (!active) return;

      const skyEvents = eventsResult.status === "fulfilled" ? eventsResult.value?.data : [];
      const launches = launchesResult.status === "fulfilled" ? launchesResult.value?.data : [];
      const artemis = launches.find((launch) => launch.name?.toLowerCase?.().includes("artemis")) || launches[0];

      setEvents(Array.isArray(skyEvents) ? skyEvents.slice(0, 4) : []);
      setNextLaunch(artemis || null);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    if (!nextLaunch?.net && !nextLaunch?.window_start && !nextLaunch?.date_utc) return "TBD";
    const target = new Date(nextLaunch.net || nextLaunch.window_start || nextLaunch.date_utc).getTime();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [nextLaunch, now]);

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    const nowDate = new Date();
    const diffDays = Math.round((date.getTime() - nowDate.getTime()) / (24 * 3600 * 1000));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading command feed…</Text>
        </View>
      </SpaceBackground>
    );
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <HeroPanel onExplore={() => navigation.navigate(ROUTE_MANIFEST.EXPLORE as never)} />
          <NextMajorEventCard
            title={nextLaunch?.name || "Upcoming Launch"}
            netLine="Launch window opens (NET)"
            countdown={countdown}
            description={
              nextLaunch?.mission?.description
                ? `${nextLaunch.mission.description.slice(0, 110)}...`
                : "Times are NET and subject to change."
            }
            onOpenBrief={() => navigation.navigate(ROUTE_MANIFEST.LAUNCHES as never)}
          />
          <UpcomingSkyEventsCard
            events={events.map((event, index) => ({
              title: event.title?.toUpperCase?.() || "SKY EVENT",
              when: formatEventDate(event.start || event.date),
              id: event.id || `${event.title || "event"}-${index}`,
            }))}
          />
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  muted: {
    marginTop: 8,
    color: '#9ca3af',
  },
});
