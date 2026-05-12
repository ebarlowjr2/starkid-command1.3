import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, FlatList, Pressable, SafeAreaView } from 'react-native'
import { getComets, getRepos } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { Badge } from '../components/home/Badge'
import { colors, spacing } from '../theme/tokens'
import { CustomText } from '../components/ui/CustomText'

type Comet = {
  designation?: string
  name?: string
}

export default function CometsScreen() {
  const [loading, setLoading] = useState(true)
  const [comets, setComets] = useState<Comet[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: notable } = await getComets({ notableOnly: true })
        const { savedItemsRepo, actor } = await getRepos()
        const saved = await savedItemsRepo.list(actor.actorId, 'comet')
        if (!active) return
        setComets(notable || [])
        setSavedCount(saved.length)
        setSavedIds(saved.map((item: any) => item.id))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <CustomText variant="body" style={styles.muted}>Loading comets…</CustomText>
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={comets}
          keyExtractor={(item, index) => `${item.designation ?? index}`}
          contentContainerStyle={styles.container}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <CustomText variant="sectionLabel" style={styles.kicker}>COMETS</CustomText>
              <CustomText variant="hero" style={styles.title}>Comet Tracker</CustomText>
              <CustomText variant="body" style={styles.subtitle}>Save comets to track observation windows.</CustomText>
              <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
                <View style={styles.badgeRow}>
                  <Badge label="SAVED" />
                  <CustomText variant="sectionLabel" style={styles.badgeHelper}>Currently tracking: {savedCount}</CustomText>
                </View>
              </GlassCard>
            </View>
          )}
          renderItem={({ item }) => {
            const id = item.designation || ''
            const saved = savedIds.includes(id)
            return (
              <GlassCard variant="secondary" style={styles.card}>
                <View style={styles.glowStrip} />
                <CustomText variant="cardTitle" style={styles.cardTitle}>{item.name || item.designation || 'Unknown Comet'}</CustomText>
                <CustomText variant="bodySmall" style={styles.cardMeta}>{item.designation}</CustomText>
                <Pressable
                  style={[styles.saveButton, saved && styles.saveButtonActive]}
                  onPress={async () => {
                    const { savedItemsRepo, actor } = await getRepos()
                    if (!id) return
                    if (saved) {
                      await savedItemsRepo.remove(actor.actorId, id, 'comet')
                    } else {
                      await savedItemsRepo.save(actor.actorId, { id, type: 'comet', designation: id, name: item.name })
                    }
                    const savedList = await savedItemsRepo.list(actor.actorId, 'comet')
                    setSavedCount(savedList.length)
                    setSavedIds(savedList.map((entry: any) => entry.id))
                  }}
                >
                  <CustomText variant="bodySmall" style={styles.saveText}>{saved ? 'Saved' : 'Save'}</CustomText>
                </Pressable>
              </GlassCard>
            )
          }}
        />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  header: { marginBottom: spacing.lg },
  kicker: { color: colors.dim, marginBottom: 6 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeHelper: { color: colors.dim, flex: 1 },
  muted: { marginTop: 8, color: colors.muted },
  card: { marginBottom: 12 },
  glowStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255,79,216,0.35)',
  },
  cardTitle: { color: colors.text },
  cardMeta: { color: colors.muted, marginTop: 6 },
  saveButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.5)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  saveButtonActive: {
    borderColor: 'rgba(255,79,216,0.6)',
    backgroundColor: 'rgba(26, 12, 32, 0.6)',
  },
  saveText: { color: colors.text },
})
