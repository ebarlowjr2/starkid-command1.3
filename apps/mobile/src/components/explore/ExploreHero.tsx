import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme/tokens";
import { CustomText } from "../ui/CustomText";

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
      <CustomText variant="sectionLabel" style={styles.kicker}>
        {title}
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        {subtitle}
      </CustomText>
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
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.muted,
  },
});
