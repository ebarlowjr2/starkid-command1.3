import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { getAlertsForUser, convertAlertToMission, ROUTES } from '@starkid/core'
import { setMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'

export default function CommandCenterScreen() {
  const navigation = useNavigation()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const list = await getAlertsForUser()
        if (active) setAlerts(list || [])
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
        <Text style={styles.muted}>Loading mission alerts…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Command Center</Text>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Mission Alerts</Text>
        {alerts.length ? (
          alerts.slice(0, 8).map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMeta}>{alert.type} • {alert.severity}</Text>
              </View>
              {alert.missionAvailable ? (
                <Pressable
                  style={styles.alertButton}
                  onPress={async () => {
                    const mission = convertAlertToMission(alert)
                    if (!mission) return
                    setMission(mission)
                    navigation.navigate(ROUTES.MISSIONS_BRIEFING as never)
                  }}
                >
                  <Text style={styles.alertButtonText}>Accept</Text>
                </Pressable>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.alertMeta}>No alerts available.</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  muted: { marginTop: 8, color: '#9ca3af' },
  title: { fontSize: 22, fontWeight: '700', color: '#f9fafb', marginBottom: 12 },
  panel: { padding: 12, borderRadius: 12, backgroundColor: '#0f172a' },
  panelTitle: { color: '#7dd3fc', fontWeight: '700', marginBottom: 8 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  alertTitle: { color: '#f9fafb', fontWeight: '600' },
  alertMeta: { color: '#9ca3af', fontSize: 12 },
  alertButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#2563eb' },
  alertButtonText: { color: '#f9fafb', fontWeight: '600', fontSize: 12 },
})
