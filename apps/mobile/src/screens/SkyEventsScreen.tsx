import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native'
import { getAllSkyEvents } from '@starkid/core'

type SkyEvent = {
  id?: string | number
  title?: string
  start?: string
  type?: string
}

export default function SkyEventsScreen() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<SkyEvent[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const results = await getAllSkyEvents({ days: 60 })
        if (active) setEvents(results)
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
        <Text style={styles.muted}>Loading sky events…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sky Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title || 'Untitled Event'}</Text>
            <Text style={styles.cardMeta}>{item.start ? item.start.slice(0, 10) : 'Date TBD'}</Text>
            {item.type ? <Text style={styles.cardMeta}>{item.type}</Text> : null}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#f9fafb' },
  muted: { marginTop: 8, color: '#9ca3af' },
  card: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#f9fafb' },
  cardMeta: { color: '#9ca3af' },
})
