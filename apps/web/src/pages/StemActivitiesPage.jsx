import React, { useEffect, useState } from 'react'
import { listStemActivities, listTracks, listLevels } from '@starkid/core'

export default function StemActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [track, setTrack] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    const data = listStemActivities({
      track: track || undefined,
      level: level || undefined,
    })
    setActivities(data)
  }, [track, level])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          STEM ACTIVITIES
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          Hands-on challenges and experiments are landing soon.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="bg-black/60 border border-cyan-600 text-cyan-200 text-xs px-2 py-1 rounded"
        >
          <option value="">All Tracks</option>
          {listTracks().map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-black/60 border border-cyan-600 text-cyan-200 text-xs px-2 py-1 rounded"
        >
          <option value="">All Levels</option>
          {listLevels().map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border border-cyan-600/50 rounded-lg p-4 bg-black/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-cyan-400 bg-cyan-900/40 px-2 py-0.5 rounded">
                {activity.track}
              </span>
              <span className="text-xs text-cyan-200/70">{activity.level}</span>
            </div>
            <div className="text-cyan-200 font-semibold">{activity.title}</div>
            <div className="text-cyan-200/70 text-sm mt-1">{activity.description}</div>
          </div>
        ))}
        {activities.length === 0 ? (
          <div className="text-cyan-200/60 text-sm">No activities match this filter.</div>
        ) : null}
      </div>
    </div>
  )
}
