import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";

type ExploreHeroProps = {
  title?: string;
  subtitle?: string;
};

export function ExploreHero({
  title = "EXPLORE HUB",
  subtitle = "Choose a console to jump into and start tracking missions.",
}: ExploreHeroProps) {
  return (
    <View style={styles.hero}>
      <Text style={styles.kicker}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 20,
    backgroundColor: "rgba(8,12,22,0.75)",
    borderWidth: 1,
    borderColor: "rgba(43,228,255,0.2)",
  },
  kicker: {
    ...typography.pixel,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
});
