import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native'
import { getMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'
import { gradeAttempt, getRepos } from '@starkid/core'

export default function MissionBriefingScreen() {
  const navigation = useNavigation()
  const mission = getMission()
  const [started, setStarted] = useState(false)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<{ pass: boolean; feedback: string } | null>(null)

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
      {!started ? (
        <Pressable style={styles.button} onPress={() => setStarted(true)}>
          <Text style={styles.buttonText}>Start Mission</Text>
        </Pressable>
      ) : null}
      {started ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Steps</Text>
          {(mission.steps || []).map((step) => (
            <Text key={step.id} style={styles.panelItem}>• {step.prompt}</Text>
          ))}
          <Text style={[styles.panelTitle, { marginTop: 12 }]}>Response</Text>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Type your response"
            placeholderTextColor="#64748b"
          />
          <Pressable
            style={[styles.button, { marginTop: 10 }]}
            onPress={async () => {
              const { pass, feedback } = gradeAttempt(mission, { main: answer })
              const { missionsRepo, actor } = await getRepos()
              const attempt = {
                missionId: mission.id,
                actorId: actor.actorId,
                answers: { main: answer },
                submittedAt: new Date().toISOString(),
                result: pass ? 'pass' : 'fail',
                feedback,
              }
              await missionsRepo.saveAttempt(actor.actorId, attempt)
              if (pass) {
                await missionsRepo.markCompleted(actor.actorId, mission.id)
              }
              setResult({ pass, feedback })
            }}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
          {result ? (
            <Text style={[styles.panelItem, { color: result.pass ? '#86efac' : '#fca5a5', marginTop: 8 }]}>
              {result.feedback}
            </Text>
          ) : null}
        </View>
      ) : null}
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
  input: { borderWidth: 1, borderColor: '#1f2937', borderRadius: 8, padding: 8, color: '#f9fafb', marginTop: 6 },
})
