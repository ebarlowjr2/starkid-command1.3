import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { colors, spacing, typography } from '../theme/tokens'
import { getCoreConfig } from '@starkid/core'

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
          <Text style={styles.kicker}>UPDATES</Text>
          <Text style={styles.title}>Official Updates</Text>
          <Text style={styles.subtitle}>Agency announcements and mission updates.</Text>

          <View style={styles.chipRow}>
            {['all', 'artemis', 'official', 'launch'].map((cat) => (
              <Pressable
                key={cat}
                style={[styles.chip, filter === cat && styles.chipActive]}
                onPress={() => setFilter(cat)}
              >
                <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>
                  {cat === 'all' ? 'ALL EVENTS' : cat.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {meta ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.meta}>EVENTS: {meta.total} • ARTEMIS: {meta.artemisCount} • STATUS: {meta.usingCache ? 'CACHED' : 'LIVE'}</Text>
            </GlassCard>
          ) : null}

          {loading ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.body}>Loading event feed…</Text>
            </GlassCard>
          ) : error ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.error}>{error}</Text>
            </GlassCard>
          ) : (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {events.map((event: any, idx: number) => {
                const catColor = getCategoryColor(event.category)
                return (
                  <Pressable key={event.id || idx} onPress={() => Linking.openURL(event.url)}>
                    <GlassCard variant="secondary">
                      <View style={styles.cardRow}>
                        <Text style={styles.icon}>{getTypeIcon(event.type)}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle}>{event.title}</Text>
                          <Text style={styles.body}>{event.summary}</Text>
                          <View style={styles.metaRow}>
                            <Text style={[styles.badge, { backgroundColor: catColor.bg, borderColor: catColor.border, color: catColor.text }]}>{event.category}</Text>
                            <Text style={styles.meta}>{event.source}</Text>
                            <Text style={styles.meta}>{formatTimeAgo(event.publishedAt)}</Text>
                          </View>
                        </View>
                      </View>
                    </GlassCard>
                  </Pressable>
                )
              })}
              {events.length === 0 ? (
                <GlassCard variant="secondary">
                  <Text style={styles.body}>No events found.</Text>
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
  meta: { ...typography.small, color: colors.dim },
  error: { ...typography.small, color: '#f87171' },
  cardRow: { flexDirection: 'row', gap: 12 },
  icon: { fontSize: 18 },
  cardTitle: { ...typography.h2, color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' },
  badge: {
    ...typography.pixel,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
})
