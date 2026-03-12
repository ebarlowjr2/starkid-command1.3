import React from 'react'

export default function SyncIdentityModal({ open, onClose, onSync }) {
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
          />
          <input
            className="w-full px-3 py-2 rounded bg-black/50 border border-cyan-700/60 text-cyan-100"
            placeholder="Password"
            type="password"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white"
            onClick={onSync}
          >
            Sync Command Profile
          </button>
          <button
            className="px-4 py-2 rounded border border-cyan-700/60 text-cyan-200 hover:text-cyan-100"
            onClick={onClose}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}
