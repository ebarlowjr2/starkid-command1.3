import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Pressable, TextInput, SafeAreaView, ScrollView } from 'react-native'
import { getMission } from '../state/missionStore'
import { useNavigation } from '@react-navigation/native'
import { gradeStemAttempt, getRepos, syncMissionCompletionToActivity, getMissionById, getCurrentActor } from '@starkid/core'
import { SpaceBackground } from '../components/home/SpaceBackground'
import { GlassCard } from '../components/home/GlassCard'
import { PixelButton } from '../components/home/PixelButton'
import { colors, spacing } from '../theme/tokens'
import { SyncIdentityModal } from '../components/auth/SyncIdentityModal'
import { CustomText } from '../components/ui/CustomText'

export default function MissionBriefingScreen({ route }: { route: any }) {
  const navigation = useNavigation()
  const missionId = route?.params?.missionId
  const mission = getMission() || (missionId ? getMissionById(missionId) : null)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ pass: boolean; feedback: string } | null>(null)
  const totalSteps = mission?.steps?.length || 0
  const answeredSteps = mission
    ? mission.steps.filter((step) => (answers?.[step.id] ?? '') !== '').length
    : 0
  const progressPct = totalSteps ? Math.round((answeredSteps / totalSteps) * 100) : 0
  const [completed, setCompleted] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    async function loadCompleted() {
      if (!mission) return
      const { missionsRepo, actor } = await getRepos()
      const isDone = await missionsRepo.isCompleted(actor.actorId, mission.id)
      setCompleted(isDone)
    }
    loadCompleted()
  }, [mission])

  useEffect(() => {
    let active = true
    async function loadActor() {
      const actor = await getCurrentActor()
      if (active) setIsGuest(actor?.mode !== 'user')
    }
    loadActor()
    return () => {
      active = false
    }
  }, [])

  if (!mission) {
    return (
      <SpaceBackground>
        <View style={styles.center}>
          <CustomText variant="title" style={styles.title}>
            No Mission Selected
          </CustomText>
          <PixelButton label="BACK" onPress={() => navigation.goBack()} />
        </View>
      </SpaceBackground>
    )
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <CustomText variant="sectionLabel" style={styles.kicker}>MISSION BRIEFING</CustomText>
          <CustomText variant="hero" style={styles.title}>{mission.title}</CustomText>
          <CustomText variant="bodySmall" style={styles.subtitle}>{mission.type} • {mission.difficulty}</CustomText>

          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <CustomText variant="body" style={styles.briefing}>{mission.briefing}</CustomText>
          </GlassCard>
          <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
            <View style={styles.progressHeader}>
              <CustomText variant="sectionLabel" style={styles.progressLabel}>Mission Progress</CustomText>
              <CustomText variant="bodySmall" style={styles.progressMeta}>{answeredSteps}/{totalSteps} • {progressPct}%</CustomText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </GlassCard>

          {!started ? (
            <PixelButton
              label={completed ? 'COMPLETED' : 'START MISSION'}
              onPress={() => setStarted(true)}
              style={{ marginTop: spacing.lg, alignSelf: 'center' }}
            />
          ) : null}

          {completed && !started ? (
            <CustomText variant="bodySmall" style={[styles.status, { color: colors.green }]}>✅ Completed</CustomText>
          ) : null}

          {started ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="sectionLabel" style={styles.panelTitle}>Steps</CustomText>
              {(mission.steps || []).map((step) => (
                <View key={step.id} style={{ marginBottom: spacing.md }}>
                  <CustomText variant="body" style={styles.panelItem}>• {step.prompt}</CustomText>
                  {step.inputType === 'choice' ? (
                    <View style={styles.choiceRow}>
                      {(step.choices || []).map((choice) => (
                        <Pressable
                          key={choice}
                          style={[styles.choiceButton, answers[step.id] === choice && styles.choiceButtonActive]}
                          onPress={() => setAnswers((prev) => ({ ...prev, [step.id]: choice }))}
                        >
                          <CustomText variant="bodySmall" style={styles.choiceText}>{choice}</CustomText>
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
                  const { pass, feedback } = gradeStemAttempt(mission, payload)
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
                    await syncMissionCompletionToActivity(mission)
                    setCompleted(true)
                  }
                  setResult({ pass, feedback })
                }}
                style={{ marginTop: spacing.md }}
              />
              {result ? (
                <View style={[styles.feedbackCard, result.pass ? styles.feedbackPass : styles.feedbackFail]}>
                  <CustomText variant="body" style={[styles.panelItem, { color: result.pass ? colors.green : '#fca5a5' }]}>
                    {result.feedback}
                  </CustomText>
                </View>
              ) : null}
              {completed ? (
                <CustomText variant="body" style={[styles.panelItem, { color: colors.green, marginTop: spacing.md }]}>✅ Completed</CustomText>
              ) : null}
              {completed && isGuest ? (
                <View style={{ marginTop: spacing.md }}>
                  <CustomText variant="bodySmall" style={styles.guestNote}>Sync Command Profile to save your rank and mission progress across devices.</CustomText>
                  <PixelButton label="SYNC COMMAND PROFILE" onPress={() => setShowSync(true)} style={{ marginTop: spacing.sm }} />
                </View>
              ) : null}
            </GlassCard>
          ) : null}

          {mission.requiredData ? (
            <GlassCard variant="secondary" style={{ marginTop: spacing.lg }}>
              <CustomText variant="sectionLabel" style={styles.panelTitle}>Required Data</CustomText>
              {Object.entries(mission.requiredData).map(([key, value]) => (
                <CustomText key={key} variant="body" style={styles.panelItem}>{key}: {value == null ? 'N/A' : String(value)}</CustomText>
              ))}
            </GlassCard>
          ) : null}

          <PixelButton label="BACK" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg, alignSelf: 'center' }} />
        </ScrollView>
        <SyncIdentityModal open={showSync} onClose={() => setShowSync(false)} onSync={() => setShowSync(false)} />
      </SafeAreaView>
    </SpaceBackground>
  )
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 44 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  kicker: { color: colors.dim, marginBottom: 6 },
  title: { color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6 },
  briefing: { color: colors.muted, lineHeight: 20 },
  panelTitle: { color: colors.dim, marginBottom: spacing.sm },
  panelItem: { color: colors.muted },
  status: { marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.3)',
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    marginTop: 6,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { color: colors.dim },
  progressMeta: { color: colors.muted },
  progressBar: { height: 8, borderRadius: 10, backgroundColor: 'rgba(61,235,255,0.15)' },
  progressFill: { height: 8, borderRadius: 10, backgroundColor: colors.accent },
  feedbackCard: { marginTop: spacing.md, borderWidth: 1, borderRadius: 12, padding: 10 },
  feedbackPass: { borderColor: 'rgba(34,197,94,0.4)', backgroundColor: 'rgba(34,197,94,0.12)' },
  feedbackFail: { borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.12)' },
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
  choiceText: { color: colors.text },
  guestNote: { color: colors.dim },
})
