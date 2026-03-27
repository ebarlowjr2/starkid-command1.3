import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listLearningModules, listTracks, listLevels, listCompletedStemActivities } from '@starkid/core'

export default function StemActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [track, setTrack] = useState('')
  const [level, setLevel] = useState('')
  const [completedIds, setCompletedIds] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    let active = true
    async function loadModules() {
      try {
        const data = await listLearningModules({
          moduleType: 'stem',
          track: track || undefined,
          level: level || undefined,
        })
        if (active) setActivities(data)
      } catch (error) {
        if (active) setActivities([])
      }
    }
    loadModules()
    return () => {
      active = false
    }
  }, [track, level])

  useEffect(() => {
    let active = true
    async function loadCompleted() {
      try {
        const completed = await listCompletedStemActivities()
        if (active) setCompletedIds((completed || []).map((item) => item.activityId))
      } catch (error) {
        if (active) setCompletedIds([])
      }
    }
    loadCompleted()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          STEM ACTIVITIES
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          Hands-on challenges and experiments are landing soon.
        </p>
        <button
          onClick={() => nav('/learning/stem/progress')}
          className="mt-3 text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded hover:text-cyan-200"
        >
          View Progress →
        </button>
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
              {completedIds.includes(activity.id) ? (
                <span className="text-xs text-green-300 bg-green-900/30 px-2 py-0.5 rounded">
                  Completed
                </span>
              ) : null}
            </div>
            <div className="text-cyan-200 font-semibold">{activity.title}</div>
            <div className="text-cyan-200/70 text-sm mt-1">{activity.description}</div>
            <button
              onClick={() => nav(`/learning/stem/${activity.id}`)}
              className="mt-3 text-xs text-cyan-300 border border-cyan-600/60 px-2 py-1 rounded hover:text-cyan-200"
            >
              View Steps →
            </button>
          </div>
        ))}
        {activities.length === 0 ? (
          <div className="text-cyan-200/60 text-sm">No activities match this filter.</div>
        ) : null}
      </div>
    </div>
  )
}
