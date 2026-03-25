import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { CustomText } from '../../../../components/ui/CustomText'
import { colors, spacing } from '../../../../theme/tokens'

export default function QuestionNumericBlock({ block, value, onChange }: any) {
  return (
    <View style={styles.container}>
      <CustomText variant="body" style={styles.prompt}>{block.prompt}</CustomText>
      <TextInput
        style={styles.input}
        value={value ? String(value) : ''}
        onChangeText={onChange}
        placeholder={block.inputLabel || 'Enter value'}
        placeholderTextColor="rgba(234,242,255,0.4)"
        keyboardType="numeric"
      />
      {block.unit ? <CustomText variant="bodySmall" style={styles.unit}>Unit: {block.unit}</CustomText> : null}
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
  },
  unit: { color: colors.dim },
})
