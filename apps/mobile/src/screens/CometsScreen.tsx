import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native'
import { getNotableComets, getRepos } from '@starkid/core'

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
        const notable = getNotableComets()
        const { savedItemsRepo, actor } = await getRepos()
        const saved = await savedItemsRepo.list(actor.actorId, 'comet')
        if (!active) return
        setComets(notable)
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading comets…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comets</Text>
      <Text style={styles.subtitle}>Saved: {savedCount}</Text>
      <FlatList
        data={comets}
        keyExtractor={(item, index) => `${item.designation ?? index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name || item.designation || 'Unknown Comet'}</Text>
            <Pressable
              style={[styles.saveButton, savedIds.includes(item.designation || '') && styles.saveButtonActive]}
              onPress={async () => {
                const { savedItemsRepo, actor } = await getRepos()
                const id = item.designation || ''
                if (!id) return
                if (savedIds.includes(id)) {
                  await savedItemsRepo.remove(actor.actorId, id, 'comet')
                } else {
                  await savedItemsRepo.save(actor.actorId, { id, type: 'comet', designation: id, name: item.name })
                }
                const saved = await savedItemsRepo.list(actor.actorId, 'comet')
                setSavedCount(saved.length)
                setSavedIds(saved.map((entry: any) => entry.id))
              }}
            >
              <Text style={styles.saveText}>{savedIds.includes(item.designation || '') ? 'Saved' : 'Save'}</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, color: '#f9fafb' },
  subtitle: { color: '#9ca3af', marginBottom: 12 },
  muted: { marginTop: 8, color: '#9ca3af' },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#f9fafb' },
  saveButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1f2937',
  },
  saveButtonActive: {
    backgroundColor: '#2563eb',
  },
  saveText: {
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: '600',
  },
})
