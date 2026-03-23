import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing } from '../theme/tokens'
import { getCoreConfig } from '@starkid/core'
import { CustomText } from '../components/ui/CustomText'

export default function UpdatesOfficialScreen() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [meta, setMeta] = useState<any | null>(null)
  const base = getCoreConfig().apiBase || ''

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const url = filter === 'all'
          ? `${base}/api/events/recent?limit=50`
          : `${base}/api/events/recent?limit=50&category=${filter}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.success) {
          setEvents(data.events || [])
          setMeta(data.meta || null)
        } else {
          setError(data.error || 'Failed to load events')
        }
      } catch (e) {
        setError('Unable to connect to event feed')
      } finally {
        setLoading(false)
      }
    }

    if (!base) {
      setError('API base not configured for updates feed')
      setLoading(false)
      return
    }
    fetchEvents()
  }, [filter])

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case 'artemis':
        return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.5)', text: '#60a5fa' }
      case 'official':
        return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80' }
      case 'launch':
        return { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.5)', text: '#fb923c' }
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.5)', text: '#94a3b8' }
    }
  }

  function getTypeIcon(type: string) {
    return type === 'page_change' ? '📄' : '📡'
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>UPDATES</CustomText>
          <CustomText variant="hero" style={styles.title}>Official Updates</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Agency announcements and mission updates.</CustomText>

          <View style={styles.chipRow}>
            {['all', 'artemis', 'official', 'launch'].map((cat) => (
              <Pressable
                key={cat}
                style={[styles.chip, filter === cat && styles.chipActive]}
                onPress={() => setFilter(cat)}
              >
                <CustomText variant="sectionLabel" style={[styles.chipText, filter === cat && styles.chipTextActive]}>
                  {cat === 'all' ? 'ALL EVENTS' : cat.toUpperCase()}
                </CustomText>
              </Pressable>
            ))}
          </View>

          {meta ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="bodySmall" style={styles.meta}>EVENTS: {meta.total} • ARTEMIS: {meta.artemisCount} • STATUS: {meta.usingCache ? 'CACHED' : 'LIVE'}</CustomText>
            </GlassCard>
          ) : null}

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="body" style={styles.body}>Loading event feed…</CustomText>
            </GlassCard>
          ) : error ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="bodySmall" style={styles.error}>{error}</CustomText>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {events.map((event: any, idx: number) => {
                const catColor = getCategoryColor(event.category)
                return (
                  <Pressable key={event.id || idx} onPress={() => Linking.openURL(event.url)}>
                    <GlassCard variant="secondary">
                      <View style={styles.cardRow}>
                        <CustomText style={styles.icon}>{getTypeIcon(event.type)}</CustomText>
                        <View style={{ flex: 1 }}>
                          <CustomText variant="cardTitle" style={styles.cardTitle}>{event.title}</CustomText>
                          <CustomText variant="body" style={styles.body}>{event.summary}</CustomText>
                          <View style={styles.metaRow}>
                            <CustomText variant="sectionLabel" style={[styles.badge, { backgroundColor: catColor.bg, borderColor: catColor.border, color: catColor.text }]}>{event.category}</CustomText>
                            <CustomText variant="bodySmall" style={styles.meta}>{event.source}</CustomText>
                            <CustomText variant="bodySmall" style={styles.meta}>{formatTimeAgo(event.publishedAt)}</CustomText>
                          </View>
                        </View>
                      </View>
                    </GlassCard>
                  </Pressable>
                )
              })}
              {events.length === 0 ? (
                <GlassCard variant="secondary">
                  <CustomText variant="body" style={styles.body}>No events found.</CustomText>
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
  meta: { color: colors.dim },
  error: { color: '#f87171' },
  cardRow: { flexDirection: 'row', gap: 12 },
  icon: { fontSize: 18 },
  cardTitle: { color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
})
