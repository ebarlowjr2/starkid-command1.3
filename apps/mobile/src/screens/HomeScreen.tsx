import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { getAPOD, getRecentSolarActivity, getAlertsForUser, convertAlertToMission } from '@starkid/core'
import { setMission } from '../state/missionStore'

export default function HomeScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<any[]>([])
  const [apodTitle, setApodTitle] = useState<string | null>(null)
  const [solarSummary, setSolarSummary] = useState<string>('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [apod, solar, alertList] = await Promise.all([
          getAPOD(),
          getRecentSolarActivity(3),
          getAlertsForUser(),
        ])
        if (!active) return
        setApodTitle(apod?.title || 'Astronomy Picture of the Day')
        setSolarSummary(`Flares: ${solar.flaresCount} • CMEs: ${solar.cmeCount} • Strongest: ${solar.strongestClass}`)
        setAlerts(alertList || [])
      } catch (error) {
        if (!active) return
        setApodTitle('APOD unavailable')
        setSolarSummary('Solar activity unavailable')
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
        <Text style={styles.muted}>Loading mission summary…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mission Summary</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>APOD</Text>
        <Text style={styles.cardValue}>{apodTitle}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Solar Activity</Text>
        <Text style={styles.cardValue}>{solarSummary}</Text>
      </View>
      <View style={styles.navRow}>
        <Pressable style={styles.navButton} onPress={() => navigation.navigate('Launches' as never)}>
          <Text style={styles.navText}>Launches</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => navigation.navigate('Sky Events' as never)}>
          <Text style={styles.navText}>Sky Events</Text>
        </Pressable>
        <Pressable style={styles.navButton} onPress={() => navigation.navigate('Comets' as never)}>
          <Text style={styles.navText}>Comets</Text>
        </Pressable>
      </View>
      <View style={styles.alertsPanel}>
        <Text style={styles.alertsTitle}>Mission Alerts</Text>
        {alerts.length ? (
          alerts.slice(0, 5).map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMeta}>{alert.type} • {alert.severity}</Text>
              </View>
              {alert.missionAvailable ? (
                <Pressable
                  style={styles.alertButton}
                  onPress={() => {
                    const mission = convertAlertToMission(alert)
                    if (mission) {
                      setMission(mission)
                      navigation.navigate('Mission Briefing' as never)
                    }
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
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#f9fafb',
  },
  muted: {
    marginTop: 8,
    color: '#9ca3af',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginBottom: 12,
  },
  cardLabel: {
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: 6,
  },
  cardValue: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1f2937',
  },
  navText: {
    color: '#f9fafb',
    fontWeight: '600',
  },
  alertsPanel: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  alertsTitle: {
    color: '#7dd3fc',
    fontWeight: '700',
    marginBottom: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  alertTitle: {
    color: '#f9fafb',
    fontWeight: '600',
  },
  alertMeta: {
    color: '#9ca3af',
    fontSize: 12,
  },
  alertButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  alertButtonText: {
    color: '#f9fafb',
    fontWeight: '600',
    fontSize: 12,
  },
})
