import React from 'react'

import { signInWithPassword, signUpWithPassword } from '@starkid/core'

export default function SyncIdentityModal({ open, onClose, onSync }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSync() {
    try {
      setLoading(true)
      setError(null)
      await signInWithPassword(email, password)
      onSync?.()
      onClose?.()
    } catch (e) {
      setError(e?.message || 'Unable to sync profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleEstablish() {
    try {
      setLoading(true)
      setError(null)
      await signUpWithPassword(email, password)
      onSync?.()
      onClose?.()
    } catch (e) {
      setError(e?.message || 'Unable to establish profile')
    } finally {
      setLoading(false)
    }
  }
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-cyan-600/40 bg-zinc-950 p-6 text-cyan-100 shadow-xl">
        <h2 className="text-xl font-semibold text-cyan-300 mb-2">Initialize Identity</h2>
        <p className="text-sm text-cyan-200/70 mb-4">
          Connect your StarKid Command profile to sync missions, ranks, alerts, and STEM progress.
        </p>

        <div className="space-y-3 mb-4">
          <input
            className="w-full px-3 py-2 rounded bg-black/50 border border-cyan-700/60 text-cyan-100"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 rounded bg-black/50 border border-cyan-700/60 text-cyan-100"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white"
            onClick={handleSync}
            disabled={loading}
          >
            {loading ? 'Syncing…' : 'Sync Command Profile'}
          </button>
          <button
            className="px-4 py-2 rounded border border-cyan-700/60 text-cyan-200 hover:text-cyan-100"
            onClick={handleEstablish}
            disabled={loading}
          >
            Establish Command Profile
          </button>
          <button
            className="px-4 py-2 rounded border border-cyan-700/60 text-cyan-200 hover:text-cyan-100"
            onClick={onClose}
          >
            Continue as Guest
          </button>
        </div>
        {error ? (
          <div className="text-xs text-red-300 mt-3">{error}</div>
        ) : null}
      </div>
    </div>
  )
}
