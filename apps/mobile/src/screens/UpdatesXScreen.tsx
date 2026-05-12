import React, { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Pressable, View, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { X_ACCOUNTS, X_CATEGORIES } from '../data/xAccounts'
import { normalizeXCards } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

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
          <CustomText variant="sectionLabel" style={styles.kicker}>UPDATES</CustomText>
          <CustomText variant="hero" style={styles.title}>X Accounts</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Space agencies • companies • journalists • trackers.</CustomText>

          <View style={styles.chipRow}>
            {X_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <CustomText variant="sectionLabel" style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                  {cat.label.toUpperCase()}
                </CustomText>
              </Pressable>
            ))}
          </View>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="body" style={styles.body}>Curated X/Twitter accounts for space news. Tap to open in X.</CustomText>
          </GlassCard>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {filtered.map((card) => (
              <Pressable key={card.id} onPress={() => Linking.openURL(card.href)}>
                <GlassCard variant="secondary">
                  <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                      <CustomText variant="sectionLabel" style={styles.avatarText}>{card.title.charAt(0)}</CustomText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <CustomText variant="cardTitle" style={styles.cardTitle}>{card.title}</CustomText>
                      <CustomText variant="bodySmall" style={styles.cardSubtitle}>{card.subtitle}</CustomText>
                      <CustomText variant="bodySmall" style={styles.cardDesc}>{card.description}</CustomText>
                      <View style={styles.cardMetaRow}>
                        {card.badge ? <CustomText variant="sectionLabel" style={styles.badge}>{card.badge}</CustomText> : null}
                        <CustomText variant="sectionLabel" style={styles.openText}>OPEN IN X →</CustomText>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
            {filtered.length === 0 ? (
              <GlassCard variant="secondary">
                <CustomText variant="body" style={styles.body}>No accounts found for this category.</CustomText>
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
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  body: { color: colors.muted },
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
  chipText: { color: colors.dim },
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
  avatarText: { color: colors.accent },
  cardTitle: { color: colors.text },
  cardSubtitle: { color: colors.accent },
  cardDesc: { color: colors.muted, marginTop: 6 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  badge: { color: colors.accent },
  openText: { color: colors.dim, marginLeft: 'auto' },
})
