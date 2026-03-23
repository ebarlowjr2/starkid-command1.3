import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { CustomText } from "../components/ui/CustomText";
import { colors, spacing } from "../theme/tokens";

const variants = [
  { key: "heroKicker", label: "Hero Kicker", sample: "WELCOME TO" },
  { key: "hero", label: "Hero", sample: "STARKID COMMAND" },
  { key: "title", label: "Title", sample: "Mission Control" },
  { key: "h2", label: "H2", sample: "Next Major Event" },
  { key: "sectionLabel", label: "Section Label", sample: "UPCOMING" },
  { key: "cardTitle", label: "Card Title", sample: "Artemis II Briefing" },
  { key: "cardMeta", label: "Card Meta", sample: "NET • 7d 04:12:10" },
  { key: "body", label: "Body", sample: "StarKid Command is a live mission-control interface for tracking, understanding, and exploring space." },
  { key: "bodySmall", label: "Body Small", sample: "Preferences stored locally. Sync Command Profile to preserve them." },
  { key: "caption", label: "Caption", sample: "Updated 2 minutes ago" },
  { key: "button", label: "Button", sample: "SYNC COMMAND PROFILE" },
  { key: "navLabel", label: "Nav Label", sample: "COMMAND" },
] as const;

export default function TypographyPreviewScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText variant="title" style={styles.header}>
        Typography Preview
      </CustomText>
      <CustomText variant="body" style={styles.subhead}>
        Dev-only preview of text variants for QA across device sizes.
      </CustomText>
      {variants.map((variant) => (
        <View key={variant.key} style={styles.block}>
          <CustomText variant="sectionLabel" style={styles.label}>
            {variant.label}
          </CustomText>
          <CustomText variant={variant.key} style={styles.sample}>
            {variant.sample}
          </CustomText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: 60,
    backgroundColor: "#0b0f1a",
  },
  header: {
    color: colors.text,
    marginBottom: 6,
  },
  subhead: {
    color: colors.dim,
    marginBottom: spacing.lg,
  },
  block: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(61,235,255,0.2)",
    backgroundColor: "rgba(8,12,22,0.6)",
    marginBottom: spacing.md,
  },
  label: {
    color: colors.accent,
    marginBottom: 6,
  },
  sample: {
    color: colors.text,
  },
});
