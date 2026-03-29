import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  ARTEMIS_PROGRAM,
  ARTEMIS_IMAGES,
  ARTEMIS_MISSIONS,
  ARTEMIS_ROCKETS,
  ARTEMIS_SYSTEMS,
  ARTEMIS_KNOWLEDGE,
  MISSION_STATUS_COLORS,
  ROUTE_MANIFEST,
  getArtemisProgramSummary,
} from "@starkid/core";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { colors, spacing } from "../theme/tokens";
import { CustomText } from "../components/ui/CustomText";

function StatusBadge({ status }: { status: string }) {
  const palette = MISSION_STATUS_COLORS[status as keyof typeof MISSION_STATUS_COLORS] || MISSION_STATUS_COLORS.TBD;
  return (
    <View style={[styles.statusBadge, { borderColor: palette.border, backgroundColor: palette.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: palette.text }]} />
      <CustomText variant="sectionLabel" style={[styles.statusText, { color: palette.text }]}>{status}</CustomText>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <CustomText variant="sectionLabel" style={styles.sectionTitle}>{children}</CustomText>;
}

function KeyValueRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.keyRow}>
      <CustomText variant="sectionLabel" style={styles.keyLabel}>{label}</CustomText>
      <CustomText variant="bodySmall" style={styles.keyValue}>{value || "TBD"}</CustomText>
    </View>
  );
}

export default function ArtemisScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<"ops" | "learn">("ops");
  const [expandedKnowledge, setExpandedKnowledge] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState(ARTEMIS_MISSIONS[0]?.id);
  const [artemisSummary, setArtemisSummary] = useState<any | null>(null);
  const [now, setNow] = useState(Date.now());

  const selectedMission = useMemo(
    () => ARTEMIS_MISSIONS.find((mission) => mission.id === selectedMissionId) || ARTEMIS_MISSIONS[0],
    [selectedMissionId]
  );

  const rocketData = selectedMission ? ARTEMIS_ROCKETS[selectedMission.rocket] : null;
  const rocketConfig = rocketData?.configurations?.[selectedMission?.rocketConfig];

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await getArtemisProgramSummary();
        if (active) setArtemisSummary(result?.data || null);
      } catch (error) {
        // fallback to static ARTEMIS_PROGRAM
      }
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

  const artemisCountdown = useMemo(() => {
    const targetIso = artemisSummary?.nextMissionDate || ARTEMIS_PROGRAM?.nextMissionDate;
    if (!targetIso) return "TBD";
    const target = new Date(targetIso).getTime();
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / (24 * 3600 * 1000));
    const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [artemisSummary, now]);

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard variant="secondary" style={styles.countdownCard}>
            <CustomText variant="sectionLabel" style={styles.countdownLabel}>ARTEMIS COUNTDOWN</CustomText>
            <CustomText variant="title" style={styles.countdownValue}>{artemisCountdown}</CustomText>
          </GlassCard>
          <GlassCard variant="secondary" style={styles.statusBar}>
            <View style={styles.statusRow}>
              <CustomText variant="sectionLabel" style={styles.statusLabel}>PROGRAM</CustomText>
              <CustomText variant="bodySmall" style={styles.statusValue}>{ARTEMIS_PROGRAM.name}</CustomText>
            </View>
            <View style={styles.statusRow}>
              <CustomText variant="sectionLabel" style={styles.statusLabel}>STATUS</CustomText>
              <StatusBadge status={ARTEMIS_PROGRAM.status} />
            </View>
            <View style={styles.statusRow}>
              <CustomText variant="sectionLabel" style={styles.statusLabel}>MISSION</CustomText>
              <CustomText variant="bodySmall" style={styles.statusValue}>{selectedMission?.name}</CustomText>
            </View>
            <View style={styles.statusRow}>
              <CustomText variant="sectionLabel" style={styles.statusLabel}>HARDWARE</CustomText>
              <CustomText variant="bodySmall" style={styles.statusValue}>SLS + ORION{selectedMission?.lander ? " + HLS" : ""}{selectedMission?.gateway ? " + GATEWAY" : ""}</CustomText>
            </View>
            <View style={styles.statusRow}>
              <CustomText variant="sectionLabel" style={styles.statusLabel}>DESTINATION</CustomText>
              <CustomText variant="bodySmall" style={styles.statusValue}>{selectedMission?.gateway ? "LUNAR GATEWAY" : selectedMission?.lander ? "LUNAR SURFACE" : "LUNAR ORBIT"}</CustomText>
            </View>
          </GlassCard>

          <View style={styles.controlsRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.navigate(ROUTE_MANIFEST.EXPLORE as never)}>
              <CustomText variant="sectionLabel" style={styles.backButtonText}>← BACK TO EXPLORE</CustomText>
            </Pressable>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[styles.toggleButton, viewMode === "ops" && styles.toggleActive]}
                onPress={() => setViewMode("ops")}
              >
                <CustomText variant="sectionLabel" style={[styles.toggleText, viewMode === "ops" && styles.toggleTextActive]}>OPS VIEW</CustomText>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, viewMode === "learn" && styles.toggleActivePurple]}
                onPress={() => setViewMode("learn")}
              >
                <CustomText variant="sectionLabel" style={[styles.toggleText, viewMode === "learn" && styles.toggleTextPurple]}>LEARN VIEW</CustomText>
              </Pressable>
            </View>
          </View>

          <SectionTitle>MISSION TIMELINE</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeline}>
            {ARTEMIS_MISSIONS.map((mission) => {
              const isActive = mission.id === selectedMissionId;
              return (
                <Pressable
                  key={mission.id}
                  style={[styles.timelineCard, isActive && styles.timelineCardActive]}
                  onPress={() => setSelectedMissionId(mission.id)}
                >
                  <CustomText variant="cardTitle" style={[styles.timelineTitle, isActive && styles.timelineTitleActive]}>{mission.name}</CustomText>
                  <StatusBadge status={mission.status} />
                  <CustomText variant="body" style={styles.timelineType}>{mission.missionType}</CustomText>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedMission ? (
            <View style={styles.cardStack}>
              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>MISSION BRIEF</SectionTitle>
                <CustomText variant="cardTitle" style={styles.cardTitle}>{selectedMission.name}</CustomText>
                <StatusBadge status={selectedMission.status} />
                <CustomText variant="body" style={styles.cardBody}>{selectedMission.summary}</CustomText>
                <View style={styles.gridTwo}>
                  <KeyValueRow label="TYPE" value={selectedMission.missionType} />
                  <KeyValueRow label="DURATION" value={selectedMission.duration} />
                </View>
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>PRIMARY OBJECTIVES</SectionTitle>
                {selectedMission.objectives.slice(0, viewMode === "ops" ? 4 : undefined).map((obj, index) => (
                  <View key={`${selectedMission.id}-obj-${index}`} style={styles.listRow}>
                    <CustomText variant="sectionLabel" style={styles.listIndex}>{String(index + 1).padStart(2, "0")}</CustomText>
                    <CustomText variant="body" style={styles.listText}>{obj}</CustomText>
                  </View>
                ))}
                {selectedMission.achievements && viewMode === "learn" ? (
                  <View style={styles.subSection}>
                    <CustomText variant="sectionLabel" style={styles.subSectionTitle}>ACHIEVEMENTS</CustomText>
                    {selectedMission.achievements.map((ach, index) => (
                      <CustomText key={`ach-${index}`} variant="bodySmall" style={styles.subSectionText}>{ach}</CustomText>
                    ))}
                  </View>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>KEY DATES</SectionTitle>
                <KeyValueRow label="LAUNCH WINDOW" value={selectedMission.dates?.launchWindow || selectedMission.launchDate || selectedMission.targetLaunch} />
                {selectedMission.dates?.milestones ? (
                  <View style={styles.milestones}>
                    {selectedMission.dates.milestones.slice(0, viewMode === "ops" ? 4 : undefined).map((milestone, index) => (
                      <View key={`milestone-${index}`} style={styles.milestoneRow}>
                        <CustomText variant="sectionLabel" style={styles.milestoneDate}>{milestone.date}</CustomText>
                        <CustomText variant="body" style={styles.milestoneText}>{milestone.event}</CustomText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>HARDWARE STACK</SectionTitle>
                <View style={styles.hardwareRow}>
                  <CustomText variant="sectionLabel" style={styles.hardwareLabel}>ROCKET</CustomText>
                  <CustomText variant="bodySmall" style={styles.hardwareValue}>SLS {rocketConfig?.name}</CustomText>
                </View>
                <View style={styles.hardwareRow}>
                  <CustomText variant="sectionLabel" style={styles.hardwareLabel}>SPACECRAFT</CustomText>
                  <CustomText variant="bodySmall" style={styles.hardwareValue}>Orion MPCV</CustomText>
                </View>
                {selectedMission.lander ? (
                  <View style={styles.hardwareRow}>
                    <CustomText variant="sectionLabel" style={styles.hardwareLabel}>LANDER</CustomText>
                    <CustomText variant="bodySmall" style={styles.hardwareValue}>Starship HLS</CustomText>
                  </View>
                ) : null}
                {selectedMission.gateway ? (
                  <View style={styles.hardwareRow}>
                    <CustomText variant="sectionLabel" style={styles.hardwareLabel}>STATION</CustomText>
                    <CustomText variant="bodySmall" style={styles.hardwareValue}>Lunar Gateway</CustomText>
                  </View>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>CREW ROSTER</SectionTitle>
                {selectedMission.crew?.members ? (
                  <View style={styles.crewGrid}>
                    {selectedMission.crew.members.map((member, index) => (
                      <View key={`crew-${index}`} style={styles.crewCard}>
                        <CustomText variant="body" style={styles.crewName}>{member.name}</CustomText>
                        <CustomText variant="sectionLabel" style={styles.crewRole}>{member.role}</CustomText>
                        <CustomText variant="bodySmall" style={styles.crewAgency}>{member.agency}</CustomText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <CustomText variant="body" style={styles.cardBody}>{selectedMission.crew === null ? "UNCREWED MISSION" : "CREW: TBD"}</CustomText>
                )}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>MISSION PATH</SectionTitle>
                <View style={styles.pathRow}>
                  {["EARTH", "TLI", selectedMission.gateway ? "GATEWAY" : "LUNAR ORBIT", selectedMission.lander ? "SURFACE" : "RETURN", "SPLASHDOWN"].map((node, index) => (
                    <View key={`path-${index}`} style={styles.pathNode}>
                      <View style={styles.pathDot} />
                      <CustomText variant="sectionLabel" style={styles.pathLabel}>{node}</CustomText>
                    </View>
                  ))}
                </View>
                {viewMode === "learn" ? (
                  <CustomText variant="bodySmall" style={styles.pathNote}>
                    TLI = Trans-Lunar Injection. Gateway missions use a near-rectilinear halo orbit staging point.
                  </CustomText>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>SYSTEMS SNAPSHOT</SectionTitle>
                {ARTEMIS_SYSTEMS.slice(0, viewMode === "ops" ? 4 : 6).map((system) => (
                  <View key={system.id} style={styles.systemRow}>
                    <CustomText variant="sectionLabel" style={styles.systemName}>{system.name.toUpperCase()}</CustomText>
                    {viewMode === "learn" ? <CustomText variant="bodySmall" style={styles.systemDescription}>{system.description}</CustomText> : null}
                  </View>
                ))}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>KNOWLEDGE BASE</SectionTitle>
                {selectedMission.facts
                  ? selectedMission.facts.slice(0, viewMode === "ops" ? 2 : undefined).map((fact, index) => (
                      <CustomText key={`fact-${index}`} variant="body" style={styles.factText}>{fact}</CustomText>
                    ))
                  : null}
                {viewMode === "learn"
                  ? ARTEMIS_KNOWLEDGE.map((item) => (
                      <Pressable
                        key={item.id}
                        style={styles.knowledgeItem}
                        onPress={() => setExpandedKnowledge(expandedKnowledge === item.id ? null : item.id)}
                      >
                        <View style={styles.knowledgeHeader}>
                          <CustomText variant="body" style={styles.knowledgeTitle}>{item.title}</CustomText>
                          <CustomText variant="sectionLabel" style={styles.knowledgeToggle}>{expandedKnowledge === item.id ? "−" : "+"}</CustomText>
                        </View>
                        {expandedKnowledge === item.id ? (
                          <CustomText variant="bodySmall" style={styles.knowledgeContent}>{item.content}</CustomText>
                        ) : null}
                      </Pressable>
                    ))
                  : null}
              </GlassCard>

              {selectedMission.publicParticipation ? (
                <GlassCard variant="secondary" style={styles.cardBlock}>
                  <SectionTitle>PUBLIC PARTICIPATION</SectionTitle>
                  <CustomText variant="cardTitle" style={styles.cardTitle}>{selectedMission.publicParticipation.title.toUpperCase()}</CustomText>
                  <CustomText variant="body" style={styles.cardBody}>
                    Generate your Artemis II boarding pass and send your name aboard Orion.
                  </CustomText>
                  <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => Linking.openURL(selectedMission.publicParticipation!.url)}
                  >
                    <CustomText variant="sectionLabel" style={styles.ctaButtonText}>{selectedMission.publicParticipation.ctaLabel}</CustomText>
                  </TouchableOpacity>
                  <CustomText variant="bodySmall" style={styles.smallNote}>{selectedMission.publicParticipation.note}</CustomText>
                  {selectedMission.publicParticipation.moreInfoUrl ? (
                    <Pressable onPress={() => Linking.openURL(selectedMission.publicParticipation!.moreInfoUrl!)}>
                      <CustomText variant="sectionLabel" style={styles.linkText}>NASA announcement →</CustomText>
                    </Pressable>
                  ) : null}
                </GlassCard>
              ) : null}
            </View>
          ) : null}

          <SectionTitle>VEHICLE GALLERY</SectionTitle>
          <View style={styles.galleryGrid}>
            {[ARTEMIS_IMAGES.slsLaunch, ARTEMIS_IMAGES.orionEarth].map((img) => (
              <GlassCard key={img.alt} variant="secondary" style={styles.galleryCard}>
                <CustomText variant="cardTitle" style={styles.galleryTitle}>{img.alt.toUpperCase()}</CustomText>
                <CustomText variant="body" style={styles.galleryCaption}>{img.caption}</CustomText>
                <CustomText variant="bodySmall" style={styles.smallNote}>{img.credit}</CustomText>
              </GlassCard>
            ))}
          </View>

          <GlassCard variant="secondary" style={styles.cardBlock}>
            <SectionTitle>DATA SOURCES</SectionTitle>
            <Pressable onPress={() => Linking.openURL("https://www.nasa.gov/artemis")}>
              <CustomText variant="sectionLabel" style={styles.linkText}>NASA Artemis Program →</CustomText>
            </Pressable>
            <Pressable onPress={() => Linking.openURL("https://www.nasa.gov/humans-in-space/orion-spacecraft/")}>
              <CustomText variant="sectionLabel" style={styles.linkText}>NASA Orion →</CustomText>
            </Pressable>
            <Pressable onPress={() => Linking.openURL("https://www.nasa.gov/exploration/systems/sls/index.html")}>
              <CustomText variant="sectionLabel" style={styles.linkText}>NASA SLS →</CustomText>
            </Pressable>
            <CustomText variant="bodySmall" style={styles.smallNote}>LAST REVIEWED: January 2025</CustomText>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  countdownCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  countdownLabel: {
    color: colors.dim,
    letterSpacing: 1.4,
  },
  countdownValue: {
    color: colors.cyan,
    marginTop: spacing.xs,
    letterSpacing: 1.2,
  },
  statusBar: {
    padding: 16,
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    color: "rgba(234, 242, 255, 0.85)",
  },
  statusValue: {
    color: colors.text,
    fontFamily: "Audiowide_400Regular",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: "700",
    fontFamily: "Audiowide_400Regular",
  },
  controlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.35)",
    backgroundColor: "rgba(34,211,238,0.08)",
  },
  backButtonText: {
    color: colors.accent,
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "rgba(34,211,238,0.3)",
  },
  toggleActivePurple: {
    backgroundColor: "rgba(168,85,247,0.3)",
  },
  toggleText: {
    color: "rgba(255,255,255,0.7)",
  },
  toggleTextActive: {
    color: colors.accent,
  },
  toggleTextPurple: {
    color: "#a855f7",
  },
  sectionTitle: {
    color: "rgba(234, 242, 255, 0.85)",
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  timeline: {
    marginBottom: spacing.lg,
  },
  timelineCard: {
    width: 180,
    marginRight: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  timelineCardActive: {
    borderColor: "rgba(34,211,238,0.6)",
    backgroundColor: "rgba(34,211,238,0.15)",
  },
  timelineTitle: {
    color: colors.text,
    marginBottom: 8,
  },
  timelineTitleActive: {
    color: colors.accent,
  },
  timelineType: {
    color: "rgba(234, 242, 255, 0.85)",
    marginTop: 6,
  },
  cardStack: {
    gap: spacing.lg,
  },
  cardBlock: {
    padding: 16,
  },
  cardTitle: {
    color: colors.text,
    marginBottom: 6,
  },
  cardBody: {
    color: "rgba(234, 242, 255, 0.9)",
    marginTop: 6,
  },
  gridTwo: {
    marginTop: 12,
    gap: 8,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingVertical: 6,
  },
  keyLabel: {
    color: "rgba(234, 242, 255, 0.9)",
  },
  keyValue: {
    color: colors.text,
    fontFamily: "Audiowide_400Regular",
  },
  listRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  listIndex: {
    color: colors.accent,
  },
  listText: {
    color: "rgba(234, 242, 255, 0.92)",
    flex: 1,
  },
  subSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  subSectionTitle: {
    color: "#22c55e",
    marginBottom: 6,
  },
  subSectionText: {
    color: "rgba(234, 242, 255, 0.9)",
    marginBottom: 4,
  },
  milestones: {
    marginTop: 10,
  },
  milestoneRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  milestoneDate: {
    color: "#EAF2FF",
    minWidth: 70,
  },
  milestoneText: {
    color: "rgba(234, 242, 255, 0.9)",
    flex: 1,
  },
  hardwareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  hardwareLabel: {
    color: "rgba(234, 242, 255, 0.85)",
  },
  hardwareValue: {
    color: colors.accent,
    fontFamily: "Audiowide_400Regular",
  },
  crewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  crewCard: {
    width: "48%",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  crewName: {
    color: colors.text,
    fontWeight: "700",
  },
  crewRole: {
    color: colors.accent,
    marginTop: 4,
  },
  crewAgency: {
    color: colors.muted,
  },
  pathRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  pathNode: {
    alignItems: "center",
    gap: 6,
  },
  pathDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  pathLabel: {
    color: "rgba(234, 242, 255, 0.85)",
  },
  pathNote: {
    color: "rgba(234, 242, 255, 0.9)",
    marginTop: 10,
  },
  systemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  systemName: {
    color: colors.accent,
    marginBottom: 4,
  },
  systemDescription: {
    color: "rgba(234, 242, 255, 0.9)",
  },
  factText: {
    color: "rgba(234, 242, 255, 0.9)",
    marginBottom: 8,
  },
  knowledgeItem: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  knowledgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  knowledgeTitle: {
    color: colors.text,
    fontWeight: "600",
  },
  knowledgeToggle: {
    color: "#a855f7",
  },
  knowledgeContent: {
    color: "rgba(234, 242, 255, 0.9)",
    marginTop: 8,
  },
  ctaButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.6)",
    backgroundColor: "rgba(34,211,238,0.15)",
  },
  ctaButtonText: {
    color: colors.text,
  },
  smallNote: {
    color: "rgba(234, 242, 255, 0.85)",
    marginTop: 8,
  },
  linkText: {
    color: colors.accent,
    marginTop: 10,
  },
  galleryGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  galleryCard: {
    padding: 14,
  },
  galleryTitle: {
    color: colors.accent,
    fontWeight: "700",
  },
  galleryCaption: {
    color: colors.muted,
    marginTop: 6,
  },
});
