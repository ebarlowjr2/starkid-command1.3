import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
} from "@starkid/core";
import { SpaceBackground } from "../components/home/SpaceBackground";
import { GlassCard } from "../components/home/GlassCard";
import { colors, spacing, typography } from "../theme/tokens";

function StatusBadge({ status }: { status: string }) {
  const palette = MISSION_STATUS_COLORS[status as keyof typeof MISSION_STATUS_COLORS] || MISSION_STATUS_COLORS.TBD;
  return (
    <View style={[styles.statusBadge, { borderColor: palette.border, backgroundColor: palette.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: palette.text }]} />
      <Text style={[styles.statusText, { color: palette.text }]}>{status}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function KeyValueRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.keyRow}>
      <Text style={styles.keyLabel}>{label}</Text>
      <Text style={styles.keyValue}>{value || "TBD"}</Text>
    </View>
  );
}

export default function ArtemisScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<"ops" | "learn">("ops");
  const [expandedKnowledge, setExpandedKnowledge] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState(ARTEMIS_MISSIONS[0]?.id);

  const selectedMission = useMemo(
    () => ARTEMIS_MISSIONS.find((mission) => mission.id === selectedMissionId) || ARTEMIS_MISSIONS[0],
    [selectedMissionId]
  );

  const rocketData = selectedMission ? ARTEMIS_ROCKETS[selectedMission.rocket] : null;
  const rocketConfig = rocketData?.configurations?.[selectedMission?.rocketConfig];

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <GlassCard variant="secondary" style={styles.statusBar}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>PROGRAM</Text>
              <Text style={styles.statusValue}>{ARTEMIS_PROGRAM.name}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>STATUS</Text>
              <StatusBadge status={ARTEMIS_PROGRAM.status} />
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>MISSION</Text>
              <Text style={styles.statusValue}>{selectedMission?.name}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>HARDWARE</Text>
              <Text style={styles.statusValue}>SLS + ORION{selectedMission?.lander ? " + HLS" : ""}{selectedMission?.gateway ? " + GATEWAY" : ""}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>DESTINATION</Text>
              <Text style={styles.statusValue}>{selectedMission?.gateway ? "LUNAR GATEWAY" : selectedMission?.lander ? "LUNAR SURFACE" : "LUNAR ORBIT"}</Text>
            </View>
          </GlassCard>

          <View style={styles.controlsRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.navigate(ROUTE_MANIFEST.EXPLORE as never)}>
              <Text style={styles.backButtonText}>← BACK TO EXPLORE</Text>
            </Pressable>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[styles.toggleButton, viewMode === "ops" && styles.toggleActive]}
                onPress={() => setViewMode("ops")}
              >
                <Text style={[styles.toggleText, viewMode === "ops" && styles.toggleTextActive]}>OPS VIEW</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, viewMode === "learn" && styles.toggleActivePurple]}
                onPress={() => setViewMode("learn")}
              >
                <Text style={[styles.toggleText, viewMode === "learn" && styles.toggleTextPurple]}>LEARN VIEW</Text>
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
                  <Text style={[styles.timelineTitle, isActive && styles.timelineTitleActive]}>{mission.name}</Text>
                  <StatusBadge status={mission.status} />
                  <Text style={styles.timelineType}>{mission.missionType}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedMission ? (
            <View style={styles.cardStack}>
              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>MISSION BRIEF</SectionTitle>
                <Text style={styles.cardTitle}>{selectedMission.name}</Text>
                <StatusBadge status={selectedMission.status} />
                <Text style={styles.cardBody}>{selectedMission.summary}</Text>
                <View style={styles.gridTwo}>
                  <KeyValueRow label="TYPE" value={selectedMission.missionType} />
                  <KeyValueRow label="DURATION" value={selectedMission.duration} />
                </View>
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>PRIMARY OBJECTIVES</SectionTitle>
                {selectedMission.objectives.slice(0, viewMode === "ops" ? 4 : undefined).map((obj, index) => (
                  <View key={`${selectedMission.id}-obj-${index}`} style={styles.listRow}>
                    <Text style={styles.listIndex}>{String(index + 1).padStart(2, "0")}</Text>
                    <Text style={styles.listText}>{obj}</Text>
                  </View>
                ))}
                {selectedMission.achievements && viewMode === "learn" ? (
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>ACHIEVEMENTS</Text>
                    {selectedMission.achievements.map((ach, index) => (
                      <Text key={`ach-${index}`} style={styles.subSectionText}>{ach}</Text>
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
                        <Text style={styles.milestoneDate}>{milestone.date}</Text>
                        <Text style={styles.milestoneText}>{milestone.event}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>HARDWARE STACK</SectionTitle>
                <View style={styles.hardwareRow}>
                  <Text style={styles.hardwareLabel}>ROCKET</Text>
                  <Text style={styles.hardwareValue}>SLS {rocketConfig?.name}</Text>
                </View>
                <View style={styles.hardwareRow}>
                  <Text style={styles.hardwareLabel}>SPACECRAFT</Text>
                  <Text style={styles.hardwareValue}>Orion MPCV</Text>
                </View>
                {selectedMission.lander ? (
                  <View style={styles.hardwareRow}>
                    <Text style={styles.hardwareLabel}>LANDER</Text>
                    <Text style={styles.hardwareValue}>Starship HLS</Text>
                  </View>
                ) : null}
                {selectedMission.gateway ? (
                  <View style={styles.hardwareRow}>
                    <Text style={styles.hardwareLabel}>STATION</Text>
                    <Text style={styles.hardwareValue}>Lunar Gateway</Text>
                  </View>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>CREW ROSTER</SectionTitle>
                {selectedMission.crew?.members ? (
                  <View style={styles.crewGrid}>
                    {selectedMission.crew.members.map((member, index) => (
                      <View key={`crew-${index}`} style={styles.crewCard}>
                        <Text style={styles.crewName}>{member.name}</Text>
                        <Text style={styles.crewRole}>{member.role}</Text>
                        <Text style={styles.crewAgency}>{member.agency}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.cardBody}>{selectedMission.crew === null ? "UNCREWED MISSION" : "CREW: TBD"}</Text>
                )}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>MISSION PATH</SectionTitle>
                <View style={styles.pathRow}>
                  {["EARTH", "TLI", selectedMission.gateway ? "GATEWAY" : "LUNAR ORBIT", selectedMission.lander ? "SURFACE" : "RETURN", "SPLASHDOWN"].map((node, index) => (
                    <View key={`path-${index}`} style={styles.pathNode}>
                      <View style={styles.pathDot} />
                      <Text style={styles.pathLabel}>{node}</Text>
                    </View>
                  ))}
                </View>
                {viewMode === "learn" ? (
                  <Text style={styles.pathNote}>
                    TLI = Trans-Lunar Injection. Gateway missions use a near-rectilinear halo orbit staging point.
                  </Text>
                ) : null}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>SYSTEMS SNAPSHOT</SectionTitle>
                {ARTEMIS_SYSTEMS.slice(0, viewMode === "ops" ? 4 : 6).map((system) => (
                  <View key={system.id} style={styles.systemRow}>
                    <Text style={styles.systemName}>{system.name.toUpperCase()}</Text>
                    {viewMode === "learn" ? <Text style={styles.systemDescription}>{system.description}</Text> : null}
                  </View>
                ))}
              </GlassCard>

              <GlassCard variant="secondary" style={styles.cardBlock}>
                <SectionTitle>KNOWLEDGE BASE</SectionTitle>
                {selectedMission.facts
                  ? selectedMission.facts.slice(0, viewMode === "ops" ? 2 : undefined).map((fact, index) => (
                      <Text key={`fact-${index}`} style={styles.factText}>{fact}</Text>
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
                          <Text style={styles.knowledgeTitle}>{item.title}</Text>
                          <Text style={styles.knowledgeToggle}>{expandedKnowledge === item.id ? "−" : "+"}</Text>
                        </View>
                        {expandedKnowledge === item.id ? (
                          <Text style={styles.knowledgeContent}>{item.content}</Text>
                        ) : null}
                      </Pressable>
                    ))
                  : null}
              </GlassCard>

              {selectedMission.publicParticipation ? (
                <GlassCard variant="secondary" style={styles.cardBlock}>
                  <SectionTitle>PUBLIC PARTICIPATION</SectionTitle>
                  <Text style={styles.cardTitle}>{selectedMission.publicParticipation.title.toUpperCase()}</Text>
                  <Text style={styles.cardBody}>
                    Generate your Artemis II boarding pass and send your name aboard Orion.
                  </Text>
                  <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => Linking.openURL(selectedMission.publicParticipation!.url)}
                  >
                    <Text style={styles.ctaButtonText}>{selectedMission.publicParticipation.ctaLabel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.smallNote}>{selectedMission.publicParticipation.note}</Text>
                  {selectedMission.publicParticipation.moreInfoUrl ? (
                    <Pressable onPress={() => Linking.openURL(selectedMission.publicParticipation!.moreInfoUrl!)}>
                      <Text style={styles.linkText}>NASA announcement →</Text>
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
                <Text style={styles.galleryTitle}>{img.alt.toUpperCase()}</Text>
                <Text style={styles.galleryCaption}>{img.caption}</Text>
                <Text style={styles.smallNote}>{img.credit}</Text>
              </GlassCard>
            ))}
          </View>

          <GlassCard variant="secondary" style={styles.cardBlock}>
            <SectionTitle>DATA SOURCES</SectionTitle>
            <Pressable onPress={() => Linking.openURL("https://www.nasa.gov/artemis")}>
              <Text style={styles.linkText}>NASA Artemis Program →</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL("https://www.nasa.gov/humans-in-space/orion-spacecraft/")}>
              <Text style={styles.linkText}>NASA Orion →</Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL("https://www.nasa.gov/exploration/systems/sls/index.html")}>
              <Text style={styles.linkText}>NASA SLS →</Text>
            </Pressable>
            <Text style={styles.smallNote}>LAST REVIEWED: January 2025</Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
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
    ...typography.pixel,
    color: "rgba(234, 242, 255, 0.85)",
    fontSize: 10,
  },
  statusValue: {
    ...typography.body,
    color: colors.text,
    fontFamily: "monospace",
    fontSize: 12,
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
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "monospace",
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
    ...typography.pixel,
    color: colors.accent,
    fontSize: 10,
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
    ...typography.pixel,
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
  },
  toggleTextActive: {
    color: colors.accent,
  },
  toggleTextPurple: {
    color: "#a855f7",
  },
  sectionTitle: {
    ...typography.pixel,
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
    ...typography.h3,
    color: colors.text,
    marginBottom: 8,
  },
  timelineTitleActive: {
    color: colors.accent,
  },
  timelineType: {
    ...typography.body,
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
    ...typography.h3,
    color: colors.text,
    marginBottom: 6,
  },
  cardBody: {
    ...typography.body,
    color: "rgba(234, 242, 255, 0.9)",
    marginTop: 6,
    lineHeight: 20,
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
    ...typography.pixel,
    color: "rgba(234, 242, 255, 0.9)",
    fontSize: 9,
  },
  keyValue: {
    ...typography.body,
    color: colors.text,
    fontFamily: "monospace",
    fontSize: 12,
  },
  listRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  listIndex: {
    ...typography.pixel,
    color: colors.accent,
    fontSize: 10,
  },
  listText: {
    ...typography.body,
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
    ...typography.pixel,
    color: "#22c55e",
    marginBottom: 6,
    fontSize: 10,
  },
  subSectionText: {
    ...typography.body,
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
    ...typography.pixel,
    color: "#EAF2FF",
    fontSize: 10,
    minWidth: 70,
  },
  milestoneText: {
    ...typography.body,
    color: "rgba(234, 242, 255, 0.9)",
    flex: 1,
  },
  hardwareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  hardwareLabel: {
    ...typography.pixel,
    color: "rgba(234, 242, 255, 0.85)",
    fontSize: 10,
  },
  hardwareValue: {
    ...typography.body,
    color: colors.accent,
    fontFamily: "monospace",
    fontSize: 12,
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
    ...typography.body,
    color: colors.text,
    fontWeight: "700",
  },
  crewRole: {
    ...typography.pixel,
    color: colors.accent,
    fontSize: 10,
    marginTop: 4,
  },
  crewAgency: {
    ...typography.body,
    color: colors.muted,
    fontSize: 11,
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
    ...typography.pixel,
    color: "rgba(234, 242, 255, 0.85)",
    fontSize: 9,
  },
  pathNote: {
    ...typography.body,
    color: "rgba(234, 242, 255, 0.9)",
    marginTop: 10,
    fontSize: 12,
  },
  systemRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  systemName: {
    ...typography.pixel,
    color: colors.accent,
    fontSize: 10,
    marginBottom: 4,
  },
  systemDescription: {
    ...typography.body,
    color: "rgba(234, 242, 255, 0.9)",
    fontSize: 12,
  },
  factText: {
    ...typography.body,
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
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  knowledgeToggle: {
    ...typography.pixel,
    color: "#a855f7",
    fontSize: 12,
  },
  knowledgeContent: {
    ...typography.body,
    color: "rgba(234, 242, 255, 0.9)",
    marginTop: 8,
    fontSize: 12,
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
    ...typography.pixel,
    color: colors.text,
    fontSize: 11,
  },
  smallNote: {
    ...typography.body,
    color: "rgba(234, 242, 255, 0.85)",
    marginTop: 8,
    fontSize: 11,
  },
  linkText: {
    ...typography.pixel,
    color: colors.accent,
    marginTop: 10,
    fontSize: 11,
  },
  galleryGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  galleryCard: {
    padding: 14,
  },
  galleryTitle: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "700",
  },
  galleryCaption: {
    ...typography.body,
    color: colors.muted,
    marginTop: 6,
  },
});
