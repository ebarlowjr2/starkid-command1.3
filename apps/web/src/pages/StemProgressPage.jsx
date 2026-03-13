import React, { useEffect, useState } from 'react'
import { getStemProgressOverview, getCurrentActor } from '@starkid/core'
import { useNavigate } from 'react-router-dom'
import SyncIdentityModal from '../components/auth/SyncIdentityModal.jsx'

const TRACK_LABELS = {
  math: 'Math',
  science: 'Science',
  cyber: 'Cyber',
  linux: 'Linux',
  ai: 'AI',
}

export default function StemProgressPage() {
  const [overview, setOverview] = useState(null)
  const [isGuest, setIsGuest] = useState(true)
  const [showSync, setShowSync] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getStemProgressOverview()
      const actor = await getCurrentActor()
      if (active) {
        setOverview(data)
        setIsGuest(actor?.mode !== 'user')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!overview) {
    return (
      <div className="p-4 max-w-5xl mx-auto text-cyan-200/70">Loading progress…</div>
    )
  }

  return (
    <>
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          STEM PROGRESS
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          Track your learning progress across all STEM tracks.
        </p>
        {isGuest ? (
          <div className="mt-3 text-xs text-cyan-300/70">
            Your progress is stored locally. Sync Command Profile to access it on other devices.
            <button
              onClick={() => setShowSync(true)}
              className="ml-3 px-2 py-1 rounded border border-cyan-600/60 text-cyan-300 hover:text-cyan-200"
            >
              Sync Command Profile
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {overview.tracks.map((track) => (
          <div key={track.track} className="border border-cyan-600/40 rounded-lg p-4 bg-black/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-cyan-200 font-semibold">
                  {TRACK_LABELS[track.track] || track.track}
                </div>
                <span className="text-[10px] text-cyan-200/80 bg-cyan-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {track.completed}/{track.total}
                </span>
              </div>
              <span className="text-[10px] text-cyan-300 bg-cyan-900/40 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {track.currentLevel || 'cadet'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-cyan-200/70 mb-2">
              <span>Progress</span>
              <span>{track.percent}%</span>
            </div>
            <div className="h-2 bg-cyan-900/40 rounded overflow-hidden">
              <div
                className="h-2 bg-cyan-400 rounded"
                style={{ width: `${track.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/40">
          <div className="text-xs text-cyan-300 mb-2 font-mono">RECOMMENDED NEXT</div>
          {overview.recommendedNextActivity ? (
            <>
              <div className="text-cyan-200 font-semibold">
                {overview.recommendedNextActivity.title}
              </div>
              <div className="text-xs text-cyan-200/70">
                {overview.recommendedNextActivity.track} • {overview.recommendedNextActivity.level}
              </div>
              <button
                className="mt-3 text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded hover:text-cyan-200"
                onClick={() => nav(`/stem-activities/${overview.recommendedNextActivity.id}`)}
              >
                Continue →
              </button>
            </>
          ) : (
            <div className="text-xs text-cyan-200/70">All activities complete.</div>
          )}
        </div>

        <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/40">
          <div className="text-xs text-cyan-300 mb-2 font-mono">RECENT COMPLETIONS</div>
          {overview.recentCompletions.length ? (
            <ul className="text-xs text-cyan-200/70 space-y-2">
              {overview.recentCompletions.slice(0, 3).map((item) => (
                <li key={item.activityId} className="flex items-center justify-between">
                  <div>
                    <div className="text-cyan-200">{item.title}</div>
                    <div className="text-[10px] text-cyan-400/80">{item.track} • {item.level}</div>
                  </div>
                  <span className="text-[10px] text-cyan-500">
                    {new Date(item.completedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-cyan-200/70">No completions yet.</div>
          )}
        </div>
      </div>
    </div>
    <SyncIdentityModal
      open={showSync}
      onClose={() => setShowSync(false)}
      onSync={() => setShowSync(false)}
    />
    </>
  )
}
