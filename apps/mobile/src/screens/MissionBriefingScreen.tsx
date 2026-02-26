import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { getMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'

export default function MissionBriefingScreen() {
  const navigation = useNavigation()
  const mission = getMission()

  if (!mission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Mission Selected</Text>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mission.title}</Text>
      <Text style={styles.subtitle}>{mission.type} • {mission.difficulty}</Text>
      <Text style={styles.briefing}>{mission.briefing}</Text>
      {mission.requiredData ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Required Data</Text>
          {Object.entries(mission.requiredData).map(([key, value]) => (
            <Text key={key} style={styles.panelItem}>{key}: {value == null ? 'N/A' : String(value)}</Text>
          ))}
        </View>
      ) : null}
      <Pressable style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0f1a' },
  title: { fontSize: 22, fontWeight: '700', color: '#f9fafb', marginBottom: 6 },
  subtitle: { color: '#9ca3af', marginBottom: 12 },
  briefing: { color: '#e5e7eb', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  panel: { padding: 12, borderRadius: 12, backgroundColor: '#111827', marginBottom: 16 },
  panelTitle: { color: '#7dd3fc', fontWeight: '700', marginBottom: 6 },
  panelItem: { color: '#e5e7eb', fontSize: 13, marginBottom: 2 },
  button: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#2563eb' },
  buttonText: { color: '#f9fafb', fontWeight: '600' },
})
