import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ROUTE_MANIFEST } from '@starkid/core'

const FEATURES = [
  { title: 'Command Center', description: 'Live mission alerts and briefings.', route: ROUTE_MANIFEST.COMMAND_CENTER },
  { title: 'Launches', description: 'Upcoming rockets and mission timelines.', route: ROUTE_MANIFEST.LAUNCHES },
  { title: 'Sky Events', description: 'Eclipses, alignments, and meteor showers.', route: ROUTE_MANIFEST.SKY_EVENTS },
  { title: 'Comets', description: 'Track comets and observational windows.', route: ROUTE_MANIFEST.COMETS },
  { title: 'Solar Map', description: 'Solar activity and monitoring tools.', route: ROUTE_MANIFEST.SOLAR_MAP },
  { title: 'Streams', description: 'Live feeds and mission streams.', route: ROUTE_MANIFEST.STREAMS },
]

export default function ExploreScreen() {
  const navigation = useNavigation()
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore Hub</Text>
      <Text style={styles.subtitle}>
        Choose a console to jump into. This mirrors the web Explore view.
      </Text>
      {FEATURES.map((feature) => (
        <Pressable
          key={feature.title}
          style={styles.card}
          onPress={() => navigation.navigate(feature.route as never)}
        >
          <Text style={styles.cardTitle}>{feature.title}</Text>
          <Text style={styles.cardBody}>{feature.description}</Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#070b14' },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#e2f8ff', marginBottom: 8 },
  subtitle: { color: 'rgba(255,255,255,0.7)', marginBottom: 16, lineHeight: 20 },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    marginBottom: 12,
  },
  cardTitle: { color: '#7dd3fc', fontWeight: '700', marginBottom: 6 },
  cardBody: { color: '#cbd5f5', fontSize: 13, lineHeight: 18 },
})
