import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getUpcomingSkyEventsService, getUpcomingLaunches, ROUTE_MANIFEST, getCurrentActor, getArtemisProgramSummary } from "@starkid/core";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { NextMajorEventCard } from "../components/home/NextMajorEventCard";
import { UpcomingSkyEventsCard } from "../components/home/UpcomingSkyEventsCard";
import { LinearGradient } from "expo-linear-gradient";
import { PixelButton } from "../components/home/PixelButton";
import { colors, spacing } from "../theme/tokens";
import { SyncIdentityModal } from "../components/auth/SyncIdentityModal";
import { CustomText } from "../components/ui/CustomText";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [nextLaunch, setNextLaunch] = useState<any | null>(null);
  const [artemis, setArtemis] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isGuest, setIsGuest] = useState(true);
  const [showSync, setShowSync] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const [eventsResult, launchesResult, artemisResult] = await Promise.allSettled([
        getUpcomingSkyEventsService({ days: 30 }),
        getUpcomingLaunches({ limit: 10 }),
        getArtemisProgramSummary(),
      ]);

      if (!active) return;

      const skyEvents = eventsResult.status === "fulfilled" ? eventsResult.value?.data : [];
      const launches = launchesResult.status === "fulfilled" ? launchesResult.value?.data : [];
      const artemisSummary = artemisResult.status === "fulfilled" ? artemisResult.value?.data : null;
      const artemis = launches.find((launch) => launch.name?.toLowerCase?.().includes("artemis")) || launches[0];

      setEvents(Array.isArray(skyEvents) ? skyEvents.slice(0, 4) : []);
      setNextLaunch(artemis || null);
      setArtemis(artemisSummary || null);
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

  const artemisCountdown = useMemo(() => {
    if (!artemis?.nextMissionDate) return "TBD";
    const target = new Date(artemis.nextMissionDate).getTime();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [artemis, now]);

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
          <CustomText variant="body" style={styles.muted}>
            Loading command feed…
          </CustomText>
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
          {isGuest ? (
            <View style={styles.syncBanner}>
              <PixelButton
                label="SYNC COMMAND PROFILE"
                onPress={() => setShowSync(true)}
              />
            </View>
          ) : null}
          <View style={styles.hero}>
            <LinearGradient
              colors={[
                "rgba(10,15,40,0.2)",
                "rgba(10,15,40,0.6)",
                "rgba(10,15,40,0.9)",
              ]}
              style={styles.heroGradient}
            />
            <CustomText style={styles.planetAccent}>🪐</CustomText>
            <CustomText style={styles.ufoAccent}>🛸</CustomText>
            <View style={styles.heroOverlay}>
              <CustomText variant="heroKicker" style={styles.heroKicker}>
                WELCOME TO
              </CustomText>
              <CustomText
                variant="hero"
                style={styles.heroTitle}
                onLongPress={() => {
                  if (__DEV__) {
                    navigation.navigate("TypographyPreview" as never);
                  }
                }}
              >
                STARKID COMMAND
              </CustomText>
              <CustomText variant="h2" style={styles.heroSubtitle}>
                Junior Science Officer Control Network
              </CustomText>
              <CustomText variant="body" style={styles.heroDescription}>
                StarKid Command is a live mission-control interface for tracking, understanding, and exploring space.
              </CustomText>
              <PixelButton
                label="EXPLORE →"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.EXPLORE as never)}
                style={styles.heroButton}
              />
            </View>
          </View>
          <View style={styles.cardStack}>
            <View style={styles.artemisCard}>
              <CustomText variant="sectionLabel" style={styles.artemisLabel}>
                ARTEMIS SPOTLIGHT
              </CustomText>
              <CustomText variant="cardTitle" style={styles.artemisTitle}>
                {artemis?.nextMission || "Artemis II"}
              </CustomText>
              <CustomText variant="bodySmall" style={styles.artemisCountdown}>
                COUNTDOWN · {artemisCountdown}
              </CustomText>
              <CustomText variant="body" style={styles.artemisBody}>
                {artemis?.description || "NASA’s priority lunar exploration program."}
              </CustomText>
              <PixelButton
                label="OPEN ARTEMIS →"
                onPress={() => navigation.navigate(ROUTE_MANIFEST.ARTEMIS as never)}
                style={styles.artemisButton}
              />
            </View>
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
    color: colors.text,
  },
  heroTitle: {
    color: colors.text,
    textAlign: "center",
    marginTop: 6,
  },
  heroSubtitle: {
    color: "#9fe8ff",
    textAlign: "center",
    marginTop: 8,
  },
  heroDescription: {
    color: "rgba(234,242,255,0.85)",
    textAlign: "center",
    marginTop: 10,
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
  syncBanner: {
    alignSelf: "flex-end",
    marginBottom: 12,
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
  artemisCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.45)",
    backgroundColor: "rgba(6,10,22,0.6)",
    marginBottom: 16,
  },
  artemisLabel: {
    color: colors.dim,
    marginBottom: 6,
    letterSpacing: 2,
  },
  artemisTitle: {
    color: colors.accent,
  },
  artemisCountdown: {
    marginTop: 6,
    color: "#9fe8ff",
    letterSpacing: 1,
  },
  artemisBody: {
    color: colors.muted,
    marginTop: 6,
  },
  artemisButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.7)",
    backgroundColor: "rgba(6, 10, 22, 0.8)",
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
