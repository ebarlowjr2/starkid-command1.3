import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { CustomText } from '../../../../components/ui/CustomText'
import { colors, spacing } from '../../../../theme/tokens'

export default function QuestionShortTextBlock({ block, value, onChange }: any) {
  return (
    <View style={styles.container}>
      <CustomText variant="body" style={styles.prompt}>{block.prompt}</CustomText>
      <TextInput
        style={styles.input}
        value={value || ''}
        onChangeText={onChange}
        placeholder={block.inputLabel || 'Enter response'}
        placeholderTextColor="rgba(234,242,255,0.4)"
        multiline
      />
      {block.exampleAnswer ? (
        <CustomText variant="bodySmall" style={styles.example}>Example: {block.exampleAnswer}</CustomText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  prompt: { color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  example: { color: colors.dim },
})
