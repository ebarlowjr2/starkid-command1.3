import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { normalizeYouTubeLiveCards, timeAgo, getCoreConfig } from '@starkid/core'
import { colors, spacing, typography } from '../theme/tokens'
import { YOUTUBE_CHANNELS } from '../data/youtubeChannels'

export default function UpdatesLiveScreen({ navigation }: any) {
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [apiConfigured, setApiConfigured] = useState(true)
  const base = getCoreConfig().apiBase || ''

  const fetchLiveStatus = async () => {
    try {
      setLoading(true)
      const url = base ? `${base}/api/youtube-live` : '/api/youtube-live'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch live status')
      const data = await response.json()
      const normalizedCards = normalizeYouTubeLiveCards(YOUTUBE_CHANNELS, data)
      setChannels(normalizedCards)
      setLastChecked(data.checkedAt)
      setApiConfigured(data.apiConfigured !== false)
      setError(null)
    } catch (e) {
      setError('Unable to check live status')
      const normalizedCards = normalizeYouTubeLiveCards(YOUTUBE_CHANNELS, { channels: [] })
      setChannels(normalizedCards)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!base) {
      setApiConfigured(false)
      setError('API base not configured for live status')
      setChannels(normalizeYouTubeLiveCards(YOUTUBE_CHANNELS, { channels: [] }))
      setLoading(false)
      return
    }
    fetchLiveStatus()
    const id = setInterval(fetchLiveStatus, 90 * 1000)
    return () => clearInterval(id)
  }, [])

  const liveChannels = useMemo(() => channels.filter((c) => c.isLive), [channels])
  const offlineChannels = useMemo(() => channels.filter((c) => !c.isLive), [channels])

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>UPDATES</Text>
          <Text style={styles.title}>Live Streams</Text>
          <Text style={styles.subtitle}>Launch feeds and mission broadcasts.</Text>

          <View style={styles.row}>
            <PixelButton
              label={loading ? 'CHECKING…' : 'REFRESH STATUS'}
              onPress={fetchLiveStatus}
              style={{ alignSelf: 'flex-start' }}
            />
            {lastChecked ? (
              <Text style={styles.meta}>Last checked: {new Date(lastChecked).toLocaleTimeString()}</Text>
            ) : null}
          </View>

          {!apiConfigured ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.notice}>YouTube API not configured. Showing monitored channels only.</Text>
            </GlassCard>
          ) : null}

          {error ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.error}>{error}</Text>
            </GlassCard>
          ) : null}

          {liveChannels.length > 0 ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <Text style={styles.sectionTitle}>LIVE NOW</Text>
              {liveChannels.map((channel) => (
                <GlassCard key={channel.channelId} variant="secondary">
                  <Text style={styles.cardTitle}>{channel.name}</Text>
                  {channel.liveTitle ? <Text style={styles.body}>{channel.liveTitle}</Text> : null}
                  <View style={styles.cardMetaRow}>
                    <Text style={styles.liveBadge}>LIVE</Text>
                    <Text style={styles.meta}>{channel.startedAt ? timeAgo(channel.startedAt) : ''}</Text>
                  </View>
                  <Pressable onPress={() => Linking.openURL(channel.liveUrl)}>
                    <Text style={styles.cta}>WATCH ON YOUTUBE →</Text>
                  </Pressable>
                </GlassCard>
              ))}
            </View>
          ) : null}

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <Text style={styles.sectionTitle}>MONITORED CHANNELS</Text>
            {offlineChannels.map((channel) => (
              <GlassCard key={channel.channelId} variant="secondary">
                <Text style={styles.cardTitle}>{channel.name}</Text>
                <Text style={styles.body}>{channel.description}</Text>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.offlineBadge}>OFFLINE</Text>
                  <Pressable onPress={() => Linking.openURL(channel.url)}>
                    <Text style={styles.cta}>VIEW CHANNEL →</Text>
                  </Pressable>
                </View>
              </GlassCard>
            ))}
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
  row: { marginTop: spacing.lg, gap: spacing.sm },
  meta: { ...typography.small, color: colors.dim },
  notice: { ...typography.small, color: '#eab308' },
  error: { ...typography.small, color: '#f87171' },
  sectionTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  cardTitle: { ...typography.h2, color: colors.text },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm },
  liveBadge: { ...typography.pixel, color: '#f87171' },
  offlineBadge: { ...typography.pixel, color: colors.dim },
  cta: { ...typography.pixel, color: colors.accent, marginTop: spacing.sm },
})
