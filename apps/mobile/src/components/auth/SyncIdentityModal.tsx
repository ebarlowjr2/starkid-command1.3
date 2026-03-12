import React from 'react'
import { Modal, View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import { PixelButton } from '../home/PixelButton'
import { colors, spacing, typography } from '../../theme/tokens'

export function SyncIdentityModal({
  open,
  onClose,
  onSync,
}: {
  open: boolean
  onClose: () => void
  onSync: () => void
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Initialize Identity</Text>
          <Text style={styles.subtitle}>
            Connect your StarKid Command profile to sync missions, ranks, alerts, and STEM progress.
          </Text>

          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(234,242,255,0.4)" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(234,242,255,0.4)" secureTextEntry />

          <View style={styles.actions}>
            <PixelButton label="SYNC COMMAND PROFILE" onPress={onSync} />
            <Pressable onPress={onClose}>
              <Text style={styles.secondary}>Continue as Guest</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.4)',
    backgroundColor: 'rgba(6, 10, 22, 0.95)',
    padding: spacing.lg,
  },
  title: { ...typography.hero, color: colors.text },
  subtitle: { ...typography.body, color: colors.muted, marginTop: 6, marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(61,235,255,0.3)',
    borderRadius: 10,
    padding: 10,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actions: { marginTop: spacing.md, gap: spacing.sm },
  secondary: { ...typography.pixel, color: colors.dim, textAlign: 'center', marginTop: spacing.sm },
})
