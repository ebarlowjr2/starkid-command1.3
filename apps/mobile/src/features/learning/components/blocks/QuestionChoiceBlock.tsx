import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { CustomText } from '../../../../components/ui/CustomText'
import { colors, spacing } from '../../../../theme/tokens'

export default function QuestionChoiceBlock({ block, value, onChange }: any) {
  const showFeedback = Boolean(value) && typeof block?.answerId === 'string'
  const correct = showFeedback ? value === block.answerId : false
  return (
    <View style={styles.container}>
      <CustomText variant="body" style={styles.prompt}>{block.prompt}</CustomText>
      <View style={styles.choiceRow}>
        {block.choices.map((choice: any) => {
          const active = value === choice.id
          return (
            <Pressable
              key={choice.id}
              onPress={() => onChange(choice.id)}
              style={[styles.choice, active && styles.choiceActive]}
            >
              <CustomText variant="bodySmall" style={[styles.choiceText, active && styles.choiceTextActive]}>
                {choice.text}
              </CustomText>
            </Pressable>
          )
        })}
      </View>
      {showFeedback ? (
        <CustomText
          variant="bodySmall"
          style={[styles.feedback, correct ? styles.feedbackGood : styles.feedbackBad]}
        >
          {correct
            ? block.correctFeedback || 'Good call. This condition is within limits.'
            : block.incorrectFeedback || 'Not quite. Re-check the limits and conditions before proceeding.'}
        </CustomText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  prompt: { color: colors.text },
  choiceRow: { gap: spacing.sm },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.35)',
    backgroundColor: 'rgba(6, 10, 22, 0.4)',
  },
  choiceActive: {
    borderColor: 'rgba(61,235,255,0.9)',
    backgroundColor: 'rgba(61,235,255,0.2)',
  },
  choiceText: { color: colors.text },
  choiceTextActive: { color: colors.text },
  feedback: { marginTop: spacing.xs },
  feedbackGood: { color: '#4ade80' },
  feedbackBad: { color: '#facc15' },
})
