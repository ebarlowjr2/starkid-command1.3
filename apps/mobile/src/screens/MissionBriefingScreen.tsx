import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, SafeAreaView, ScrollView } from 'react-native'
import { getMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'
import { gradeAttempt, getRepos } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing, typography } from '../theme/tokens'

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
      <SpaceBackground>
        <View style={styles.center}>
          <Text style={styles.title}>No Mission Selected</Text>
          <PixelButton label="BACK" onPress={() => navigation.goBack()} />
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>MISSION BRIEFING</Text>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.subtitle}>{mission.type} • {mission.difficulty}</Text>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <Text style={styles.briefing}>{mission.briefing}</Text>
          </GlassCard>

          {!started ? (
            <PixelButton
              label={completed ? 'COMPLETED' : 'START MISSION'}
              onPress={() => setStarted(true)}
              style={{ marginTop: spacing.lg, alignSelf: 'center' }}
            />
          ) : null}

          {completed && !started ? (
            <Text style={[styles.status, { color: colors.green }]}>✅ Completed</Text>
          ) : null}

          {started ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.panelTitle}>Steps</Text>
              {(mission.steps || []).map((step) => (
                <View key={step.id} style={{ marginBottom: spacing.md }}>
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
                      placeholderTextColor="rgba(234,242,255,0.4)"
                      keyboardType={step.inputType === 'number' ? 'numeric' : 'default'}
                    />
                  )}
                </View>
              ))}
              <PixelButton
                label={completed ? 'COMPLETED' : 'SUBMIT'}
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
                style={{ marginTop: spacing.md }}
              />
              {result ? (
                <Text style={[styles.panelItem, { color: result.pass ? colors.green : '#fca5a5', marginTop: spacing.md }]}>
                  {result.feedback}
                </Text>
              ) : null}
              {completed ? (
                <Text style={[styles.panelItem, { color: colors.green, marginTop: spacing.md }]}>✅ Completed</Text>
              ) : null}
            </GlassCard>
          ) : null}

          {mission.requiredData ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <Text style={styles.panelTitle}>Required Data</Text>
              {Object.entries(mission.requiredData).map(([key, value]) => (
                <Text key={key} style={styles.panelItem}>{key}: {value == null ? 'N/A' : String(value)}</Text>
              ))}
            </GlassCard>
          ) : null}

          <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg, alignSelf: 'center' }} />
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  kicker: { ...typography.pixel, color: colors.dim, marginBottom: 6 },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.small, color: colors.muted, marginTop: 6 },
  briefing: { ...typography.body, color: colors.muted, lineHeight: 20 },
  panelTitle: { ...typography.pixel, color: colors.dim, marginBottom: spacing.sm },
  panelItem: { ...typography.body, color: colors.muted },
  status: { ...typography.small, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.3)',
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    marginTop: 6,
  },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  choiceButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    backgroundColor: 'rgba(6, 10, 22, 0.6)',
  },
  choiceButtonActive: {
    borderColor: 'rgba(255,79,216,0.6)',
    backgroundColor: 'rgba(26, 12, 32, 0.6)',
  },
  choiceText: { ...typography.small, color: colors.text },
})
