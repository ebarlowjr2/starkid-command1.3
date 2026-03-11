import React, { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { X_ACCOUNTS, X_CATEGORIES } from '../data/xAccounts'
import { normalizeXCards } from '@starkid/core'

export default function UpdatesXScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const cards = useMemo(() => normalizeXCards(X_ACCOUNTS), [])
  const filtered = selectedCategory === 'all'
    ? cards
    : cards.filter((card) => card.category === selectedCategory)

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>UPDATES</Text>
          <Text style={styles.title}>X Accounts</Text>
          <Text style={styles.subtitle}>Space agencies • companies • journalists • trackers.</Text>

          <View style={styles.chipRow}>
            {X_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                  {cat.label.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.body}>Curated X/Twitter accounts for space news. Tap to open in X.</Text>
          </GlassCard>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {filtered.map((card) => (
              <Pressable key={card.id} onPress={() => Linking.openURL(card.href)}>
                <GlassCard variant="secondary">
                  <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{card.title.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                      <Text style={styles.cardDesc}>{card.description}</Text>
                      <View style={styles.cardMetaRow}>
                        {card.badge ? <Text style={styles.badge}>{card.badge}</Text> : null}
                        <Text style={styles.openText}>OPEN IN X →</Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
            {filtered.length === 0 ? (
              <GlassCard variant="secondary">
                <Text style={styles.body}>No accounts found for this category.</Text>
              </GlassCard>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 8 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6 },
  body: { ...typography.body, color: colors.muted },
  chipRow: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    backgroundColor: 'rgba(6, 10, 22, 0.45)',
  },
  chipActive: {
    borderColor: 'rgba(61,235,255,0.9)',
    backgroundColor: 'rgba(61,235,255,0.18)',
  },
  chipText: { ...typography.pixel, color: colors.dim },
  chipTextActive: { color: colors.text },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(61,235,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.pixel, color: colors.accent },
  cardTitle: { ...typography.h2, color: colors.text },
  cardSubtitle: { ...typography.small, color: colors.accent },
  cardDesc: { ...typography.small, color: colors.muted, marginTop: 6 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  badge: { ...typography.pixel, color: colors.accent },
  openText: { ...typography.pixel, color: colors.dim, marginLeft: 'auto' },
})
