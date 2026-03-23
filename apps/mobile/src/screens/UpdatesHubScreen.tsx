import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { ROUTE_MANIFEST } from '@starkid/core'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

const SECTIONS = [
  { id: 'official', title: 'Official Updates', subtitle: 'NASA mission updates and official feeds.', route: ROUTE_MANIFEST.UPDATES_OFFICIAL, icon: '🛰️' },
  { id: 'news', title: 'News', subtitle: 'Latest space news from trusted sources.', route: ROUTE_MANIFEST.UPDATES_NEWS, icon: '📰' },
  { id: 'blog', title: 'Blog', subtitle: 'StarKid Command mission logs and articles.', route: ROUTE_MANIFEST.UPDATES_BLOG, icon: '📝' },
  { id: 'live', title: 'Live', subtitle: 'Launch livestreams and mission broadcasts.', route: ROUTE_MANIFEST.UPDATES_LIVE, icon: '🔴' },
  { id: 'x', title: 'X Accounts', subtitle: 'Curated space agency accounts.', route: ROUTE_MANIFEST.UPDATES_X, icon: '𝕏' },
]

export default function UpdatesHubScreen({ navigation }: any) {
  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>UPDATES</CustomText>
          <CustomText variant="hero" style={styles.title}>News • Blog • Live</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Mission updates and curated feeds.</CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <View style={styles.badgeRow}>
              <Badge label="LIVE" />
              <CustomText variant="sectionLabel" style={styles.badgeHelper}>Pick a channel to open</CustomText>
            </View>
          </GlassCard>

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            {SECTIONS.map((section) => (
              <Pressable key={section.id} onPress={() => navigation?.navigate?.(section.route)}>
                <GlassCard variant="secondary">
                  <View style={styles.row}>
                    <CustomText style={styles.icon}>{section.icon}</CustomText>
                    <View style={{ flex: 1 }}>
                      <CustomText variant="cardTitle" style={styles.cardTitle}>{section.title}</CustomText>
                      <CustomText variant="bodySmall" style={styles.cardSubtitle}>{section.subtitle}</CustomText>
                    </View>
                    <CustomText variant="sectionLabel" style={styles.chevron}>→</CustomText>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
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
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeHelper: { color: colors.dim, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 22 },
  cardTitle: { color: colors.text },
  cardSubtitle: { color: colors.muted, marginTop: 4 },
  chevron: { color: colors.dim },
})
