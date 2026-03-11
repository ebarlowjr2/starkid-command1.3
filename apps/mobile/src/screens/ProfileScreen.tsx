import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TextInput, Pressable } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { PixelButton } from "../components/home/PixelButton";
import { colors, spacing, typography } from "../theme/tokens";
import { getProfile, updateProfile } from "@starkid/core";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any | null>(null);
  const [form, setForm] = useState({ displayName: "", bio: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await getProfile();
      if (!active) return;
      setProfile(data);
      setForm({ displayName: data.displayName, bio: data.bio || "" });
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (!profile) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <Text style={styles.body}>Loading profile…</Text>
        </View>
      </SpaceBackground>
    );
  }

  const prefs = profile.alertPreferences;
  const saved = profile.savedCounts;
  const stats = profile.stats;

  const toggle = async (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] };
    const updated = await updateProfile({ alertPreferences: next });
    setProfile((prev: any) => ({ ...prev, alertPreferences: updated.alertPreferences || next }));
  };

  const saveProfile = async () => {
    const updated = await updateProfile({ displayName: form.displayName, bio: form.bio });
    setProfile((prev: any) => ({ ...prev, ...updated }));
  };

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>COMMANDER PROFILE</Text>
          <Text style={styles.title}>{profile.displayName}</Text>
          <Text style={styles.subtitle}>{profile.rank} • Joined {new Date(profile.joinedAt).toLocaleDateString()}</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.body}>{profile.bio || "Guest profile — sign in later to sync across devices."}</Text>
          </GlassCard>

          <View style={styles.statsGrid}>
            {[
              { label: "Missions", value: stats.missionsCompleted },
              { label: "Activities", value: stats.activitiesCompleted },
              { label: "Saved", value: saved.nearEarthObjects + saved.comets + saved.skyEvents },
              { label: "STEM Level", value: stats.currentStemLevel || "Cadet" },
            ].map((item) => (
              <GlassCard key={item.label} variant="secondary" style={styles.statCard}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </GlassCard>
            ))}
          </View>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Alert Preferences</Text>
            {[
              ["missionAlerts", "Mission Alerts"],
              ["launches", "Launches"],
              ["lunarEvents", "Lunar Events"],
              ["asteroidFlybys", "Asteroid Flybys"],
              ["spaceWeather", "Space Weather"],
              ["stemRecommendations", "STEM Recommendations"],
            ].map(([key, label]) => (
              <Pressable
                key={key}
                style={[styles.prefRow, prefs[key] ? styles.prefOn : styles.prefOff]}
                onPress={() => toggle(key)}
              >
                <Text style={styles.prefLabel}>{label}</Text>
                <Text style={styles.prefValue}>{prefs[key] ? "ON" : "OFF"}</Text>
              </Pressable>
            ))}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Saved Objects</Text>
            <View style={styles.savedRow}>
              <Text style={styles.savedItem}>NEO: {saved.nearEarthObjects}</Text>
              <Text style={styles.savedItem}>Comets: {saved.comets}</Text>
              <Text style={styles.savedItem}>Sky Events: {saved.skyEvents}</Text>
              <Text style={styles.savedItem}>Missions: {saved.missions}</Text>
              <Text style={styles.savedItem}>Activities: {saved.activities}</Text>
            </View>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={form.displayName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, displayName: value }))}
              placeholder="Display name"
              placeholderTextColor="rgba(234,242,255,0.4)"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={form.bio}
              onChangeText={(value) => setForm((prev) => ({ ...prev, bio: value }))}
              placeholder="Short bio"
              placeholderTextColor="rgba(234,242,255,0.4)"
              multiline
            />
            <PixelButton label="SAVE PROFILE" onPress={saveProfile} style={{ marginTop: spacing.md, alignSelf: "flex-start" }} />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.small, color: colors.muted, marginTop: 6 },
  body: { ...typography.body, color: colors.muted },
  statsGrid: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statCard: { width: "47%" },
  statLabel: { ...typography.small, color: colors.dim },
  statValue: { ...typography.h2, color: colors.text, marginTop: 6 },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  prefOn: { borderBottomWidth: 1, borderBottomColor: "rgba(61,235,255,0.2)" },
  prefOff: { borderBottomWidth: 1, borderBottomColor: "rgba(61,235,255,0.08)" },
  prefLabel: { ...typography.body, color: colors.text },
  prefValue: { ...typography.pixel, color: colors.accent },
  savedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  savedItem: { ...typography.small, color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.3)",
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    marginTop: spacing.sm,
  },
});
