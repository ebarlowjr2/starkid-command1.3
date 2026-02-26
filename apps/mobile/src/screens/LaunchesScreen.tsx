import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native'
import { getUpcomingLaunchesFromLibrary } from '@starkid/core'

type LaunchItem = {
  id?: string | number
  name?: string
  net?: string
  window_start?: string
  pad?: { name?: string }
}

export default function LaunchesScreen() {
  const [loading, setLoading] = useState(true)
  const [launches, setLaunches] = useState<LaunchItem[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const results = await getUpcomingLaunchesFromLibrary(10)
        if (active) setLaunches(results)
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
        <Text style={styles.muted}>Loading upcoming launches…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Launches</Text>
      <FlatList
        data={launches}
        keyExtractor={(item, index) => `${item.id ?? index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name || 'Unknown Launch'}</Text>
            <Text style={styles.cardMeta}>{item.net || item.window_start || 'Date TBD'}</Text>
            {item.pad?.name ? <Text style={styles.cardMeta}>{item.pad.name}</Text> : null}
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
