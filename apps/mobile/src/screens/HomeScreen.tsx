import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getUpcomingSkyEventsService, getUpcomingLaunches, ROUTE_MANIFEST, getCurrentActor } from "@starkid/core";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { NextMajorEventCard } from "../components/home/NextMajorEventCard";
import { UpcomingSkyEventsCard } from "../components/home/UpcomingSkyEventsCard";
import { LinearGradient } from "expo-linear-gradient";
import { PixelButton } from "../components/home/PixelButton";
import { colors, spacing, typography } from "../theme/tokens";
import { SyncIdentityModal } from "../components/auth/SyncIdentityModal";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [nextLaunch, setNextLaunch] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isGuest, setIsGuest] = useState(true);
  const [showSync, setShowSync] = useState(false);

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
    let active = true;
    async function loadActor() {
      const actor = await getCurrentActor();
      if (active) setIsGuest(actor?.mode !== "user");
    }
    loadActor();
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
    <ImageBackground
      source={require("../../assets/backgrounds/starkid-home-hero.png")}
      style={styles.screenBackground}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <LinearGradient
              colors={[
                "rgba(10,15,40,0.2)",
                "rgba(10,15,40,0.6)",
                "rgba(10,15,40,0.9)",
              ]}
              style={styles.heroGradient}
            />
            <Text style={styles.planetAccent}>🪐</Text>
            <Text style={styles.ufoAccent}>🛸</Text>
            {isGuest ? (
              <View style={styles.syncButton}>
                <PixelButton
                  label="SYNC COMMAND PROFILE"
                  onPress={() => setShowSync(true)}
                />
              </View>
            ) : null}
            <View style={styles.heroOverlay}>
              <Text style={styles.heroKicker}>WELCOME TO</Text>
              <Text style={styles.heroTitle}>STARKID COMMAND</Text>
              <Text style={styles.heroSubtitle}>Junior Science Officer Control Network</Text>
              <Text style={styles.heroDescription}>
                StarKid Command is a live mission-control interface for tracking, understanding, and exploring space.
              </Text>
              <PixelButton
                label="EXPLORE →"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.EXPLORE as never)}
                style={styles.heroButton}
              />
            </View>
          </View>
          <View style={styles.cardStack}>
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
          </View>
          <View style={styles.cardStack}>
            <UpcomingSkyEventsCard
              events={events.map((event, index) => ({
                title: event.title?.toUpperCase?.() || "SKY EVENT",
                when: formatEventDate(event.start || event.date),
                id: event.id || `${event.title || "event"}-${index}`,
              }))}
            />
          </View>
        </ScrollView>
        <SyncIdentityModal open={showSync} onClose={() => setShowSync(false)} onSync={() => setShowSync(false)} />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: 44,
  },
  screenBackground: {
    flex: 1,
  },
  hero: {
    height: 340,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(61,235,255,0.55)",
    backgroundColor: "rgba(6,10,22,0.35)",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  heroKicker: {
    ...typography.pixel,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.text,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginTop: 6,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#9fe8ff",
    textAlign: "center",
    marginTop: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: "rgba(234,242,255,0.85)",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  heroButton: {
    marginTop: 10,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2be4ff",
    backgroundColor: "rgba(0,0,0,0.35)",
    shadowColor: "#2be4ff",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  syncButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  planetAccent: {
    position: "absolute",
    top: 16,
    left: 16,
    fontSize: 22,
  },
  ufoAccent: {
    position: "absolute",
    top: 16,
    right: 16,
    fontSize: 22,
  },
  cardStack: {
    marginTop: 24,
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
