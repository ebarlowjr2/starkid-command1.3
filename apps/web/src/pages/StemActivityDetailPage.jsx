import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getStemActivityById, getRepos } from '@starkid/core'

export default function StemActivityDetailPage() {
  const { activityId } = useParams()
  const activity = getStemActivityById(activityId)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function loadCompleted() {
      try {
        const { stemProgressRepo, actor } = await getRepos()
        const isDone = await stemProgressRepo.isCompleted(actor.actorId, activityId)
        if (active) setCompleted(isDone)
      } catch (error) {
        if (active) setCompleted(false)
      }
    }
    if (activityId) loadCompleted()
    return () => {
      active = false
    }
  }, [activityId])

  if (!activity) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-cyan-200/70">Activity not found.</div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-400 font-mono mb-2">
          {activity.title}
        </h2>
        <p className="text-sm text-cyan-200/70 font-mono">
          {activity.track} • {activity.level}
        </p>
      </div>

      <div className="border border-cyan-600/50 rounded-lg p-4 bg-black/40 mb-4">
        <div className="text-cyan-200/80 text-sm">{activity.description}</div>
      </div>

      <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/30">
        <div className="text-xs text-cyan-300 mb-2 font-mono">STEPS</div>
        <ol className="text-sm text-cyan-200/70 space-y-2 list-decimal list-inside">
          {activity.steps.map((step) => (
            <li key={step.id}>{step.prompt}</li>
          ))}
        </ol>
      </div>

      <div className="mt-5 flex items-center gap-3">
        {completed ? (
          <span className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded">
            Completed
          </span>
        ) : (
          <button
            className="text-xs text-cyan-300 border border-cyan-600/60 px-3 py-1 rounded hover:text-cyan-200 disabled:opacity-60"
            disabled={saving}
            onClick={async () => {
              try {
                setSaving(true)
                const { stemProgressRepo, actor } = await getRepos()
                await stemProgressRepo.markCompleted(actor.actorId, activity.id)
                setCompleted(true)
              } finally {
                setSaving(false)
              }
            }}
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  )
}
