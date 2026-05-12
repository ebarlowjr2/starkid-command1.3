import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View, Pressable, Linking } from 'react-native'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { normalizeYouTubeLiveCards, timeAgo, getCoreConfig } from '@starkid/core'
import { colors, spacing } from '../theme/tokens'
import { YOUTUBE_CHANNELS } from '../data/youtubeChannels'
import { CustomText } from '../components/ui/CustomText'

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
          <CustomText variant="sectionLabel" style={styles.kicker}>UPDATES</CustomText>
          <CustomText variant="hero" style={styles.title}>Live Streams</CustomText>
          <CustomText variant="body" style={styles.subtitle}>Launch feeds and mission broadcasts.</CustomText>

          <View style={styles.row}>
            <PixelButton
              label={loading ? 'CHECKING…' : 'REFRESH STATUS'}
              onPress={fetchLiveStatus}
              style={{ alignSelf: 'flex-start' }}
            />
            {lastChecked ? (
              <CustomText variant="bodySmall" style={styles.meta}>Last checked: {new Date(lastChecked).toLocaleTimeString()}</CustomText>
            ) : null}
          </View>

          {!apiConfigured ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="bodySmall" style={styles.notice}>YouTube API not configured. Showing monitored channels only.</CustomText>
            </GlassCard>
          ) : null}

          {error ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="bodySmall" style={styles.error}>{error}</CustomText>
            </GlassCard>
          ) : null}

          {liveChannels.length > 0 ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <CustomText variant="sectionLabel" style={styles.sectionTitle}>LIVE NOW</CustomText>
              {liveChannels.map((channel) => (
                <GlassCard key={channel.channelId} variant="secondary">
                  <CustomText variant="cardTitle" style={styles.cardTitle}>{channel.name}</CustomText>
                  {channel.liveTitle ? <CustomText variant="body" style={styles.body}>{channel.liveTitle}</CustomText> : null}
                  <View style={styles.cardMetaRow}>
                    <CustomText variant="sectionLabel" style={styles.liveBadge}>LIVE</CustomText>
                    <CustomText variant="bodySmall" style={styles.meta}>{channel.startedAt ? timeAgo(channel.startedAt) : ''}</CustomText>
                  </View>
                  <Pressable onPress={() => Linking.openURL(channel.liveUrl)}>
                    <CustomText variant="sectionLabel" style={styles.cta}>WATCH ON YOUTUBE →</CustomText>
                  </Pressable>
                </GlassCard>
              ))}
            </View>
          ) : null}

          <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
            <CustomText variant="sectionLabel" style={styles.sectionTitle}>MONITORED CHANNELS</CustomText>
            {offlineChannels.map((channel) => (
              <GlassCard key={channel.channelId} variant="secondary">
                <CustomText variant="cardTitle" style={styles.cardTitle}>{channel.name}</CustomText>
                <CustomText variant="body" style={styles.body}>{channel.description}</CustomText>
                <View style={styles.cardMetaRow}>
                  <CustomText variant="sectionLabel" style={styles.offlineBadge}>OFFLINE</CustomText>
                  <Pressable onPress={() => Linking.openURL(channel.url)}>
                    <CustomText variant="sectionLabel" style={styles.cta}>VIEW CHANNEL →</CustomText>
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
  kicker: { color: colors.dim, marginBottom: 8 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  body: { color: colors.muted },
  row: { marginTop: spacing.lg, gap: spacing.sm },
  meta: { color: colors.dim },
  notice: { color: '#eab308' },
  error: { color: '#f87171' },
  sectionTitle: { color: colors.dim, marginBottom: spacing.sm },
  cardTitle: { color: colors.text },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.sm },
  liveBadge: { color: '#f87171' },
  offlineBadge: { color: colors.dim },
  cta: { color: colors.accent, marginTop: spacing.sm },
})
