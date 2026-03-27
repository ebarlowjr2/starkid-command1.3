import React from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { CustomText } from '../../../components/ui/CustomText'
import { colors, spacing } from '../../../theme/tokens'
import QuestionNumericBlock from './blocks/QuestionNumericBlock'
import QuestionShortTextBlock from './blocks/QuestionShortTextBlock'
import QuestionChoiceBlock from './blocks/QuestionChoiceBlock'

export default function BlockRenderer({ block, value, onChange, onCheckpoint }: any) {
  switch (block.type) {
    case 'mission_brief':
      return (
        <View style={styles.block}>
          <CustomText variant="sectionLabel" style={styles.kicker}>MISSION BRIEF</CustomText>
          <CustomText variant="h2" style={styles.title}>{block.heading}</CustomText>
          <CustomText variant="body" style={styles.body}>{block.body}</CustomText>
          {block.context ? <CustomText variant="bodySmall" style={styles.context}>{block.context}</CustomText> : null}
          {block.stats?.length ? (
            <View style={{ marginTop: spacing.sm }}>
              {block.stats.map((stat: string) => (
                <CustomText key={stat} variant="bodySmall" style={styles.stat}>• {stat}</CustomText>
              ))}
            </View>
          ) : null}
        </View>
      )
    case 'concept':
      return (
        <View style={styles.block}>
          <CustomText variant="h2" style={styles.title}>{block.title || 'Concept'}</CustomText>
          <CustomText variant="body" style={styles.body}>{block.body}</CustomText>
          {block.bullets?.length ? (
            <View style={{ marginTop: spacing.sm }}>
              {block.bullets.map((item: string) => (
                <CustomText key={item} variant="bodySmall" style={styles.stat}>• {item}</CustomText>
              ))}
            </View>
          ) : null}
        </View>
      )
    case 'instruction':
      return (
        <View style={styles.block}>
          <CustomText variant="h2" style={styles.title}>Instructions</CustomText>
          {block.steps.map((step: string) => (
            <CustomText key={step} variant="body" style={styles.body}>• {step}</CustomText>
          ))}
          {block.workedExample ? (
            <View style={styles.example}>
              <CustomText variant="h2" style={styles.exampleTitle}>Worked Example</CustomText>
              <CustomText variant="body" style={styles.body}>{block.workedExample.problem}</CustomText>
              <CustomText variant="bodySmall" style={styles.context}>{block.workedExample.solution}</CustomText>
              {block.workedExample.steps?.length ? (
                <View style={{ marginTop: spacing.sm }}>
                  {block.workedExample.steps.map((step: string) => (
                    <CustomText key={step} variant="bodySmall" style={styles.stat}>• {step}</CustomText>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )
    case 'worked_example':
      return (
        <View style={styles.block}>
          <CustomText variant="h2" style={styles.title}>Worked Example</CustomText>
          <CustomText variant="body" style={styles.body}>{block.problem}</CustomText>
          <CustomText variant="bodySmall" style={styles.context}>{block.solution}</CustomText>
          {block.steps?.length ? (
            <View style={{ marginTop: spacing.sm }}>
              {block.steps.map((step: string) => (
                <CustomText key={step} variant="bodySmall" style={styles.stat}>• {step}</CustomText>
              ))}
            </View>
          ) : null}
        </View>
      )
    case 'question_numeric':
      return <QuestionNumericBlock block={block} value={value} onChange={onChange} />
    case 'question_short_text':
      return <QuestionShortTextBlock block={block} value={value} onChange={onChange} />
    case 'question_multiple_choice':
      return <QuestionChoiceBlock block={block} value={value} onChange={onChange} />
    case 'hint':
      return (
        <View style={styles.hint}>
          <CustomText variant="bodySmall" style={styles.hintText}>HINT: {block.text}</CustomText>
        </View>
      )
    case 'checkpoint':
      return (
        <View style={styles.block}>
          <CustomText variant="body" style={styles.body}>{block.prompt}</CustomText>
          <Pressable onPress={() => onCheckpoint(true)} style={[styles.checkButton, value && styles.checkButtonActive]}>
            <CustomText variant="bodySmall" style={styles.checkText}>{value ? 'Checkpoint Complete' : 'Acknowledge'}</CustomText>
          </Pressable>
        </View>
      )
    case 'submission_prompt':
      return (
        <View style={styles.block}>
          <CustomText variant="body" style={styles.body}>{block.prompt}</CustomText>
          <CustomText variant="bodySmall" style={styles.context}>{block.instruction}</CustomText>
          {block.completionMessage ? (
            <View style={styles.example}>
              <CustomText variant="h2" style={styles.exampleTitle}>Mission Complete</CustomText>
              <CustomText variant="bodySmall" style={styles.stat}>{block.completionMessage}</CustomText>
              {block.completionNextSteps?.length ? (
                <View style={{ marginTop: spacing.sm }}>
                  {block.completionNextSteps.map((step: string) => (
                    <CustomText key={step} variant="bodySmall" style={styles.stat}>• {step}</CustomText>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )
    case 'completion':
      return (
        <View style={styles.block}>
          <CustomText variant="body" style={styles.body}>{block.message}</CustomText>
          {block.nextSteps?.length ? (
            <View style={{ marginTop: spacing.sm }}>
              {block.nextSteps.map((step: string) => (
                <CustomText key={step} variant="bodySmall" style={styles.stat}>• {step}</CustomText>
              ))}
            </View>
          ) : null}
        </View>
      )
    default:
      return <CustomText variant="body" style={styles.body}>Unsupported block</CustomText>
  }
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm },
  kicker: { color: colors.dim },
  title: { color: colors.text },
  body: { color: colors.text },
  context: { color: colors.dim },
  stat: { color: colors.muted },
  example: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(61,235,255,0.2)',
  },
  exampleTitle: { color: colors.text, marginBottom: spacing.sm },
  hint: {
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(26,12,32,0.5)',
  },
  hintText: { color: '#c4b5fd' },
  checkButton: {
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    backgroundColor: 'rgba(6,10,22,0.4)',
  },
  checkButtonActive: { borderColor: 'rgba(61,235,255,0.9)', backgroundColor: 'rgba(61,235,255,0.2)' },
  checkText: { color: colors.text },
})
