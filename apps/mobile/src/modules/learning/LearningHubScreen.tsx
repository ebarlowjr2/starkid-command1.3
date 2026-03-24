import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable } from "react-native";
import { SpaceBackground } from "../../components/home/SpaceBackground";
import { GlassCard } from "../../components/home/GlassCard";
import { colors, spacing } from "../../theme/tokens";
import { ROUTE_MANIFEST } from "@starkid/core";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { CustomText } from "../../components/ui/CustomText";

// Learning Hub is intentionally modular.
// Future development of STEM tracks, Cyber Lab,
// and training systems should occur within
// modules/learning and packages/core/src/learning
// without modifying the main application.

type Nav = NativeStackNavigationProp<any>;

export default function LearningHubScreen() {
  const navigation = useNavigation<Nav>();

  const cards = [
    {
      title: "STEM Activities",
      description: "Hands-on missions based on space events.",
      route: ROUTE_MANIFEST.LEARNING_STEM,
    },
    {
      title: "Cyber Lab",
      description: "Cybersecurity training environment.",
      route: ROUTE_MANIFEST.LEARNING_CYBERLAB,
    },
    {
      title: "AI Systems",
      description: "Future training track for AI mission ops.",
      route: "LearningAI",
      disabled: true,
    },
    {
      title: "Linux Systems",
      description: "Future terminal-based ops training.",
      route: "LearningLinux",
      disabled: true,
    },
    {
      title: "Space Engineering",
      description: "Future engineering simulations and labs.",
      route: "LearningEngineering",
      disabled: true,
    },
  ];

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>LEARNING HUB</CustomText>
          <Pressable onLongPress={() => __DEV__ && navigation.navigate('LearningPreview')} style={styles.debugTap}>
            <CustomText variant="h2" style={styles.title}>Training Command Console</CustomText>
          </Pressable>
          <CustomText variant="body" style={styles.subtitle}>STEM, Cyber, and future training systems live here.</CustomText>

          <View style={styles.grid}>
            {cards.map((card) => (
              <Pressable
                key={card.title}
                disabled={card.disabled}
                onPress={() => !card.disabled && navigation.navigate(card.route)}
                style={({ pressed }) => [
                  styles.card,
                  card.disabled && styles.cardDisabled,
                  pressed && !card.disabled && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <GlassCard variant="secondary" style={{ padding: spacing.md }}>
                  <CustomText variant="cardTitle" style={styles.cardTitle}>{card.title}</CustomText>
                  <CustomText variant="body" style={styles.cardBody}>{card.description}</CustomText>
                  <CustomText variant="sectionLabel" style={styles.cardCta}>{card.disabled ? "COMING SOON" : "OPEN →"}</CustomText>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  debugTap: {},
  grid: { marginTop: spacing.lg, gap: spacing.md },
  card: {},
  cardDisabled: { opacity: 0.6 },
  cardTitle: { color: colors.accent, marginBottom: 6 },
  cardBody: { color: colors.muted },
  cardCta: { color: colors.accent, marginTop: spacing.sm },
});
