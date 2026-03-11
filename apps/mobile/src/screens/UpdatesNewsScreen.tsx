import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Image, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { NEWS_FEEDS, NEWS_CATEGORIES } from '../data/newsFeeds'
import { normalizeNewsCards, timeAgo, getCoreConfig } from '@starkid/core'

export default function UpdatesNewsScreen() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isFallback, setIsFallback] = useState(false)
  const base = getCoreConfig().apiBase || ''

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = base ? `${base}/api/news` : '/api/news'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch news')
      const data = await response.json()
      const normalizedCards = normalizeNewsCards(NEWS_FEEDS, data.news || [], { maxItems: 80 })
      setNews(normalizedCards)
      setIsFallback(data.fallback || false)
    } catch (e) {
      setError('Unable to load news feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!base) {
      setError('API base not configured for news feed')
      setLoading(false)
      return
    }
    fetchNews()
  }, [])

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter((item) => item.category === selectedCategory)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    return timeAgo(dateString)
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>UPDATES</Text>
          <Text style={styles.title}>Space News</Text>
          <Text style={styles.subtitle}>Headlines from trusted space sources.</Text>

          <View style={styles.chipRow}>
            {NEWS_CATEGORIES.map((cat) => (
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
            <Pressable style={styles.refresh} onPress={fetchNews} disabled={loading}>
              <Text style={styles.refreshText}>{loading ? 'SYNCING…' : 'REFRESH'}</Text>
            </Pressable>
          </View>

          {isFallback ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.notice}>Using cached sample data. Live RSS feeds unavailable.</Text>
            </GlassCard>
          ) : null}

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>Syncing news feeds…</Text>
            </GlassCard>
          ) : error ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.error}>{error}</Text>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {filteredNews.map((item: any, index: number) => (
                <Pressable key={item.id || `${item.subtitle}-${index}`} onPress={() => Linking.openURL(item.href)}>
                  <GlassCard variant="secondary">
                    <View style={styles.cardRow}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
                      ) : null}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        {item.description ? (
                          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                        ) : null}
                        <View style={styles.metaRow}>
                          <Text style={styles.badge}>{item.metaLeft || item.subtitle}</Text>
                          <Text style={styles.meta}>{item.metaRight || formatDate(item.publishedAt)}</Text>
                          <Text style={styles.read}>READ →</Text>
                        </View>
                      </View>
                    </View>
                  </GlassCard>
                </Pressable>
              ))}
              {filteredNews.length === 0 ? (
                <GlassCard variant="secondary">
                  <Text style={styles.body}>No news found for this category.</Text>
                </GlassCard>
              ) : null}
            </View>
          )}
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
  chipRow: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
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
  refresh: { marginLeft: 'auto' },
  refreshText: { ...typography.pixel, color: colors.accent },
  notice: { ...typography.small, color: '#eab308' },
  error: { ...typography.small, color: '#f87171' },
  cardRow: { flexDirection: 'row', gap: 12 },
  thumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: 'rgba(61,235,255,0.1)' },
  cardTitle: { ...typography.h2, color: colors.text },
  cardDesc: { ...typography.small, color: colors.muted, marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm },
  badge: { ...typography.pixel, color: colors.accent },
  meta: { ...typography.small, color: colors.dim },
  read: { ...typography.pixel, color: colors.dim, marginLeft: 'auto' },
})
