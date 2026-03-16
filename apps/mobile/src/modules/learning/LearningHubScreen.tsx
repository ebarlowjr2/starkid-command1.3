import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SpaceBackground } from "../../components/home/SpaceBackground";
import { GlassCard } from "../../components/home/GlassCard";
import { colors, spacing, typography } from "../../theme/tokens";
import { ROUTE_MANIFEST } from "@starkid/core";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

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
          <Text style={styles.kicker}>LEARNING HUB</Text>
          <Text style={styles.title}>Training Command Console</Text>
          <Text style={styles.subtitle}>STEM, Cyber, and future training systems live here.</Text>

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
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardBody}>{card.description}</Text>
                  <Text style={styles.cardCta}>{card.disabled ? "COMING SOON" : "OPEN →"}</Text>
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
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  grid: { marginTop: spacing.lg, gap: spacing.md },
  card: {},
  cardDisabled: { opacity: 0.6 },
  cardTitle: { ...typography.h3, color: colors.accent, marginBottom: 6 },
  cardBody: { ...typography.body, color: colors.muted },
  cardCta: { ...typography.pixel, color: colors.accent, marginTop: spacing.sm },
});
