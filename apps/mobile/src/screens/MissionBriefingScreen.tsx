import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native'
import { getMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'
import { gradeAttempt, getRepos } from '@starkid/core'

export default function MissionBriefingScreen() {
  const navigation = useNavigation()
  const mission = getMission()
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ pass: boolean; feedback: string } | null>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    async function loadCompleted() {
      if (!mission) return
      const { missionsRepo, actor } = await getRepos()
      const isDone = await missionsRepo.isCompleted(actor.actorId, mission.id)
      setCompleted(isDone)
    }
    loadCompleted()
  }, [mission])

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
        <Pressable
          style={[styles.button, completed && styles.buttonDisabled]}
          onPress={() => setStarted(true)}
          disabled={completed}
        >
          <Text style={styles.buttonText}>{completed ? 'Completed' : 'Start Mission'}</Text>
        </Pressable>
      ) : null}
      {completed && !started ? (
        <Text style={[styles.panelItem, { color: '#86efac', marginBottom: 8 }]}>✅ Completed</Text>
      ) : null}
      {started ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Steps</Text>
          {(mission.steps || []).map((step) => (
            <View key={step.id} style={{ marginBottom: 10 }}>
              <Text style={styles.panelItem}>• {step.prompt}</Text>
              {step.inputType === 'choice' ? (
                <View style={styles.choiceRow}>
                  {(step.choices || []).map((choice) => (
                    <Pressable
                      key={choice}
                      style={[styles.choiceButton, answers[step.id] === choice && styles.choiceButtonActive]}
                      onPress={() => setAnswers((prev) => ({ ...prev, [step.id]: choice }))}
                    >
                      <Text style={styles.choiceText}>{choice}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={answers[step.id] || ''}
                  onChangeText={(value) => setAnswers((prev) => ({ ...prev, [step.id]: value }))}
                  placeholder={step.unitLabel ? `Enter value (${step.unitLabel})` : 'Enter response'}
                  placeholderTextColor="#64748b"
                  keyboardType={step.inputType === 'number' ? 'numeric' : 'default'}
                />
              )}
            </View>
          ))}
          <Pressable
            style={[styles.button, { marginTop: 10 }]}
            onPress={async () => {
              const firstStep = mission.steps[0]
              const payload = firstStep ? { main: answers[firstStep.id] } : { main: null }
              const { pass, feedback } = gradeAttempt(mission, payload)
              const { missionsRepo, actor } = await getRepos()
              const attempt = {
                missionId: mission.id,
                actorId: actor.actorId,
                answers,
                submittedAt: new Date().toISOString(),
              }
              await missionsRepo.saveAttempt(actor.actorId, attempt)
              if (pass) {
                await missionsRepo.markCompleted(actor.actorId, mission.id)
                setCompleted(true)
              }
              setResult({ pass, feedback })
            }}
            disabled={completed}
          >
            <Text style={styles.buttonText}>{completed ? 'Completed' : 'Submit'}</Text>
          </Pressable>
          {result ? (
            <Text style={[styles.panelItem, { color: result.pass ? '#86efac' : '#fca5a5', marginTop: 8 }]}>
              {result.feedback}
            </Text>
          ) : null}
          {completed ? (
            <Text style={[styles.panelItem, { color: '#86efac', marginTop: 8 }]}>✅ Completed</Text>
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
  buttonDisabled: { backgroundColor: '#14532d' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  choiceButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#1f2937' },
  choiceButtonActive: { backgroundColor: '#2563eb' },
  choiceText: { color: '#f9fafb', fontSize: 12, fontWeight: '600' },
})
