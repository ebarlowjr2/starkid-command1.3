import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getLearningModuleById, isStemActivityCompleted, markStemActivityCompleted, getSession, getUserProgressForModule } from '@starkid/core'
import SyncIdentityModal from '../../../components/auth/SyncIdentityModal.jsx'

export default function StemActivityDetailPage() {
  const { activityId } = useParams()
  const [activity, setActivity] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSync, setShowSync] = useState(false)
  const [resumeStep, setResumeStep] = useState(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [progressStatus, setProgressStatus] = useState('not_started')
  const hasMissionEntry = Boolean(activity?.missionContext || activity?.objective)
  const levelLabel = (() => {
    const lvl = activity?.level
    if (!lvl) return ''
    if (lvl === 'explorer') return 'Intermediate'
    if (lvl === 'specialist') return 'Advanced'
    if (lvl === 'operator') return 'Expert'
    return `${lvl.charAt(0).toUpperCase()}${lvl.slice(1)}`
  })()

  useEffect(() => {
    let active = true
    async function loadActivity() {
      try {
        const module = await getLearningModuleById(activityId)
        if (active) setActivity(module)
      } catch (error) {
        if (active) setActivity(null)
      }
    }
    if (activityId) loadActivity()
    return () => {
      active = false
    }
  }, [activityId])

  useEffect(() => {
    let active = true
    async function loadProgress() {
      try {
        const session = await getSession()
        if (active) setIsAuthed(Boolean(session))
        if (!session?.userId) {
          if (active) setResumeStep(null)
          return
        }
        const progress = await getUserProgressForModule(activityId)
        if (active && progress?.status === 'in_progress') {
          setResumeStep(progress.currentStepIndex + 1)
          setProgressStatus('in_progress')
        }
        if (active && progress?.status === 'completed') {
          setCompleted(true)
          setProgressStatus('completed')
        }
        if (active && !progress) {
          setProgressStatus('not_started')
        }
      } catch (error) {
        if (active) setResumeStep(null)
      }
    }
    if (activityId) loadProgress()
    return () => {
      active = false
    }
  }, [activityId])
  useEffect(() => {
    let active = true
    async function loadCompleted() {
      try {
        const isDone = await isStemActivityCompleted(activityId)
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
        <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/30 text-cyan-200/70">
          Activity not found or failed to load.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-cyan-200/70 font-mono">STEM ACTIVITY</div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white font-mono mt-2">
          {activity.title}
        </h2>
        {hasMissionEntry ? (
          <>
            <div className="text-white/70 mt-2">{activity.tagline || 'Mission training for Command.'}</div>
            <div className="text-sm text-cyan-200/70 font-mono mt-2">
              {(activity.trainingType || 'STEM')} • {levelLabel || 'Cadet'} • {(activity.blockCount || 7)} Blocks • {(activity.estimatedMinutes || 5)} min
            </div>
          </>
        ) : (
          <p className="text-sm text-cyan-200/70 font-mono mt-2">
            {activity.track} • {activity.level}
          </p>
        )}
      </div>

      {hasMissionEntry ? (
        <>
          <div className="border border-cyan-600/50 rounded-lg p-4 bg-black/40 mb-4">
            <div className="text-cyan-200/80 text-sm">{activity.description}</div>
          </div>

          <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/30">
            <div className="text-xs text-cyan-300 mb-2 font-mono">MISSION CONTEXT</div>
            <div className="text-white/80 text-sm">{activity.missionContext}</div>
            <div className="mt-4 text-xs text-cyan-300 mb-2 font-mono">OBJECTIVE</div>
            <div className="text-white/80 text-sm">{activity.objective}</div>
            {activity.missionOutcomes?.length ? (
              <>
                <div className="mt-4 text-xs text-cyan-300 mb-2 font-mono">IN THIS MISSION, YOU WILL</div>
                <ul className="text-white/70 text-sm list-disc pl-4 space-y-1">
                  {activity.missionOutcomes.map((o) => <li key={o}>{o}</li>)}
                </ul>
              </>
            ) : null}
          </div>

          <div className="border border-cyan-600/40 rounded-lg p-4 bg-black/30 mt-4">
            <div className="text-xs text-cyan-300 mb-2 font-mono">{activity.blockCount || 7} GUIDED STEPS</div>
            <ul className="text-sm text-cyan-200/70 space-y-1 list-disc pl-4">
              {(activity.blockList || []).map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {activity.lessonSlug ? (
          <button
            className="text-xs text-cyan-300 border border-cyan-600/60 px-3 py-1 rounded hover:text-cyan-200 disabled:opacity-60"
            onClick={async () => {
              const session = await getSession()
              if (!session?.userId) {
                setShowSync(true)
                return
              }
              window.location.href = `/learning/lesson/${activity.lessonSlug}`
            }}
          >
            START MISSION
          </button>
        ) : null}
        {activity.lessonSlug && isAuthed ? (
          <span className="text-xs text-cyan-200/80">
            Status: {progressStatus === 'in_progress' ? 'In Progress' : progressStatus === 'completed' ? 'Completed' : 'Not Started'}
          </span>
        ) : null}
        {activity.lessonSlug && activity.xpReward ? (
          <span className="text-xs text-cyan-200/80">XP Reward: {activity.xpReward}</span>
        ) : null}
        {resumeStep ? (
          <span className="text-xs text-cyan-200/80">Resume from Step {resumeStep}</span>
        ) : null}
        {completed ? (
          <span className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded">
            Completed
          </span>
        ) : activity.lessonSlug ? null : (
          <button
            className="text-xs text-cyan-300 border border-cyan-600/60 px-3 py-1 rounded hover:text-cyan-200 disabled:opacity-60"
            disabled={saving}
            onClick={async () => {
              try {
                setSaving(true)
                await markStemActivityCompleted(activity.id, activity)
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
      <SyncIdentityModal
        open={showSync}
        onClose={() => setShowSync(false)}
        onSync={() => setShowSync(false)}
      />
    </div>
  )
}
