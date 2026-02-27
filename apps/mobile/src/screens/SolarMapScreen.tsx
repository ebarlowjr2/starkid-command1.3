import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function SolarMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solar Map</Text>
      <Text style={styles.body}>Solar Map is available on web for now.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0f1a' },
  title: { fontSize: 22, fontWeight: '700', color: '#f9fafb', marginBottom: 8 },
  body: { color: '#9ca3af' },
})
