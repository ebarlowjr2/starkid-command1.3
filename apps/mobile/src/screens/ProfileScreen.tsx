import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView, StyleSheet, View, ScrollView, TextInput, Pressable, Switch } from "react-native";
import { Linking } from "react-native";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { PixelButton } from "../components/home/PixelButton";
import { colors, spacing } from "../theme/tokens";
import { getProfile, updateProfile, getCurrentActor, signOut, getSession } from "@starkid/core";
import { SyncIdentityModal } from "../components/auth/SyncIdentityModal";
import { useFocusEffect } from "@react-navigation/native";
import { CustomText } from "../components/ui/CustomText";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any | null>(null);
  const [form, setForm] = useState({ displayName: "", bio: "" });
  const [isGuest, setIsGuest] = useState(true);
  const [showSync, setShowSync] = useState(false);

  const loadProfile = async (activeRef?: { current: boolean }) => {
    const session = await getSession();
    const actor = await getCurrentActor();
    const data = await getProfile();
    if (activeRef && !activeRef.current) return;
    setProfile(data);

    // Source of truth: if Supabase session exists, this is NOT a guest.
    // (Actor mode can lag if getSession hasn't hydrated yet.)
    setIsGuest(!session?.userId);
    setForm({ displayName: data.displayName, bio: data.bio || "" });
  };

  useEffect(() => {
    const activeRef = { current: true };
    loadProfile(activeRef);
    return () => {
      activeRef.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  if (!profile) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <CustomText variant="body" style={styles.body}>
            Loading profile…
          </CustomText>
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
          <CustomText variant="sectionLabel" style={styles.kicker}>COMMANDER PROFILE</CustomText>
          <CustomText variant="hero" style={styles.title}>{isGuest ? `Guest ${profile.rank}` : profile.displayName}</CustomText>
          <CustomText variant="bodySmall" style={styles.subtitle}>
            {isGuest ? "Local Profile" : "Command Profile"} • Joined {new Date(profile.joinedAt).toLocaleDateString()}
          </CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="body" style={styles.body}>
              {isGuest
                ? "Guest profile — sync later to access on other devices."
                : (profile.bio || "Command profile synced.")}
            </CustomText>
            {isGuest ? (
              <PixelButton
                label="SYNC COMMAND PROFILE"
                onPress={() => setShowSync(true)}
                style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
              />
            ) : (
              <Pressable
                onPress={async () => {
                  await signOut();
                  await loadProfile();
                }}
                style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
              >
                <CustomText variant="button" style={styles.signOut}>Sign Out</CustomText>
              </Pressable>
            )}
          </GlassCard>

          <View style={styles.statsGrid}>
            {[
              { label: "Missions", value: stats.missionsCompleted },
              { label: "Activities", value: stats.activitiesCompleted },
              { label: "Saved", value: saved.nearEarthObjects + saved.comets + saved.skyEvents },
              { label: "STEM Level", value: stats.currentStemLevel || "Cadet" },
            ].map((item) => (
              <GlassCard key={item.label} variant="secondary" style={styles.statCard}>
                <CustomText variant="bodySmall" style={styles.statLabel}>{item.label}</CustomText>
                <CustomText variant="cardTitle" style={styles.statValue}>{item.value}</CustomText>
              </GlassCard>
            ))}
          </View>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Alert Preferences</CustomText>
            {[
              ["missionAlerts", "Mission Alerts"],
              ["launches", "Launches"],
              ["lunarEvents", "Lunar Events"],
              ["asteroidFlybys", "Asteroid Flybys"],
              ["spaceWeather", "Space Weather"],
              ["stemRecommendations", "STEM Recommendations"],
            ].map(([key, label]) => (
              <View
                key={key}
                style={[styles.prefRow, prefs[key] ? styles.prefOn : styles.prefOff]}
              >
                <CustomText variant="body" style={styles.prefLabel}>{label}</CustomText>
                <Switch
                  value={!!prefs[key]}
                  onValueChange={() => toggle(key)}
                  trackColor={{ false: "rgba(148,163,184,0.4)", true: "rgba(61,235,255,0.6)" }}
                  thumbColor={prefs[key] ? colors.text : "#cbd5f5"}
                />
              </View>
            ))}
            {isGuest ? (
              <CustomText variant="bodySmall" style={styles.note}>
                Preferences stored locally. Sync Command Profile to preserve them.
              </CustomText>
            ) : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Saved Objects</CustomText>
            <View style={styles.savedRow}>
              <CustomText variant="bodySmall" style={styles.savedItem}>NEO: {saved.nearEarthObjects}</CustomText>
              <CustomText variant="bodySmall" style={styles.savedItem}>Comets: {saved.comets}</CustomText>
              <CustomText variant="bodySmall" style={styles.savedItem}>Sky Events: {saved.skyEvents}</CustomText>
              <CustomText variant="bodySmall" style={styles.savedItem}>Missions: {saved.missions}</CustomText>
              <CustomText variant="bodySmall" style={styles.savedItem}>Activities: {saved.activities}</CustomText>
            </View>
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Edit Profile</CustomText>
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
            {isGuest ? (
              <CustomText variant="bodySmall" style={styles.note}>Initialize Identity to sync this profile.</CustomText>
            ) : null}
          </GlassCard>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>Legal & About</CustomText>
            {[
              ['About StarKid Command', 'https://starkidcommand.com/about'],
              ['Privacy Policy', 'https://starkidcommand.com/privacy'],
              ['Terms of Service', 'https://starkidcommand.com/terms'],
            ].map(([label, url]) => (
              <Pressable
                key={label}
                onPress={() => Linking.openURL(url)}
                style={styles.legalRow}
              >
                <CustomText variant="body" style={styles.legalText}>{label}</CustomText>
                <CustomText variant="bodySmall" style={styles.legalArrow}>→</CustomText>
              </Pressable>
            ))}
          </GlassCard>
          <SyncIdentityModal
            open={showSync}
            onClose={() => setShowSync(false)}
            onSync={async () => {
              setShowSync(false);
              await loadProfile();
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  body: { color: colors.muted },
  statsGrid: { marginTop: spacing.lg, flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statCard: { width: "47%" },
  statLabel: { color: colors.dim },
  statValue: { color: colors.text, marginTop: 6 },
  sectionTitle: { color: colors.dim, marginBottom: spacing.sm },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  prefOn: { borderBottomWidth: 1, borderBottomColor: "rgba(61,235,255,0.2)" },
  prefOff: { borderBottomWidth: 1, borderBottomColor: "rgba(61,235,255,0.08)" },
  prefLabel: { color: colors.text },
  prefValue: { color: colors.accent },
  savedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  savedItem: { color: colors.muted },
  note: { color: colors.dim, marginTop: spacing.sm },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(61,235,255,0.12)",
  },
  legalText: { color: colors.text },
  legalArrow: { color: colors.accent },
  signOut: {
    color: colors.text,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.6)",
    backgroundColor: "rgba(61,235,255,0.18)",
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.3)",
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    marginTop: spacing.sm,
  },
});
