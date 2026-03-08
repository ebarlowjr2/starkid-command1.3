import React, { useEffect, useState } from 'react'
import { getStemProgressOverview } from '@starkid/core'
import { useNavigate } from 'react-router-dom'

const TRACK_LABELS = {
  math: 'Math',
  science: 'Science',
  cyber: 'Cyber',
  linux: 'Linux',
  ai: 'AI',
}

export default function StemProgressPage() {
  const [overview, setOverview] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getStemProgressOverview()
      if (active) setOverview(data)
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
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          STEM PROGRESS
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          Track your learning progress across all STEM tracks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {overview.tracks.map((track) => (
          <div key={track.track} className="border border-cyan-600/40 rounded-lg p-4 bg-black/40">
            <div className="flex items-center justify-between mb-2">
              <div className="text-cyan-200 font-semibold">
                {TRACK_LABELS[track.track] || track.track}
              </div>
              <span className="text-xs text-cyan-300 bg-cyan-900/30 px-2 py-0.5 rounded">
                {track.currentLevel || 'cadet'}
              </span>
            </div>
            <div className="text-xs text-cyan-200/70 mb-2">
              {track.completed} / {track.total} complete
            </div>
            <div className="h-2 bg-cyan-900/40 rounded">
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
                  <span>{item.title}</span>
                  <span className="text-cyan-400">{item.track}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-cyan-200/70">No completions yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
