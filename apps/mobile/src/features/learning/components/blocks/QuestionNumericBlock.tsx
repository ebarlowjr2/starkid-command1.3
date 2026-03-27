import React, { useState } from 'react'
import { View, TextInput, StyleSheet, Pressable } from 'react-native'
import { CustomText } from '../../../../components/ui/CustomText'
import { colors, spacing } from '../../../../theme/tokens'

export default function QuestionNumericBlock({ block, value, onChange }: any) {
  const [showHint, setShowHint] = useState(false)
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
      {block.hint ? (
        <View style={styles.hintWrap}>
          <Pressable onPress={() => setShowHint((prev) => !prev)} style={styles.hintButton}>
            <CustomText variant="bodySmall" style={styles.hintLabel}>
              {showHint ? 'Hide Hint' : 'Need a hint?'}
            </CustomText>
          </Pressable>
          {showHint ? <CustomText variant="bodySmall" style={styles.hintText}>{block.hint}</CustomText> : null}
        </View>
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
  },
  unit: { color: colors.dim },
  hintWrap: { marginTop: spacing.sm },
  hintButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.45)',
    backgroundColor: 'rgba(26,12,32,0.5)',
  },
  hintLabel: { color: '#c4b5fd' },
  hintText: { color: '#c4b5fd', marginTop: spacing.sm },
})
