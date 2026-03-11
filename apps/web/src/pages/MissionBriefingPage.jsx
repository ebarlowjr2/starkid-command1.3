import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMission } from '../state/missionStore.js'
import { gradeStemAttempt, getRepos, syncMissionCompletionToActivity, getMissionById } from '@starkid/core'

export default function MissionBriefingPage() {
  const nav = useNavigate()
  const { missionId } = useParams()
  const mission = getMission()
  const missionFromStore = missionId ? getMissionById(missionId) : null
  const activeMission = mission || missionFromStore
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const totalSteps = activeMission?.steps?.length || 0
  const answeredSteps = activeMission
    ? activeMission.steps.filter((step) => (answers?.[step.id] ?? '') !== '').length
    : 0
  const progressPct = totalSteps ? Math.round((answeredSteps / totalSteps) * 100) : 0
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    async function loadCompleted() {
      if (!activeMission) return
      const { missionsRepo, actor } = await getRepos()
      const isDone = await missionsRepo.isCompleted(actor.actorId, activeMission.id)
      setCompleted(isDone)
    }
    loadCompleted()
  }, [activeMission])

  if (!activeMission) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-semibold mb-4">No Mission Selected</h1>
        <button
          className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500"
          onClick={() => nav('/command')}
        >
          Back to Command Center
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-2">{activeMission.title}</h1>
      <div className="text-sm text-cyan-200 mb-4">
        {activeMission.type} • {activeMission.difficulty}
      </div>
      <p className="text-sm mb-4">{activeMission.briefing}</p>
      <div className="mb-4 border border-cyan-700/60 rounded-lg p-3 bg-black/40">
        <div className="flex items-center justify-between text-xs text-cyan-300/80 mb-2">
          <span>Mission Progress</span>
          <span>{answeredSteps} / {totalSteps} steps • {progressPct}%</span>
        </div>
        <div className="h-2 bg-cyan-900/40 rounded overflow-hidden">
          <div className="h-2 bg-cyan-400 rounded" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      {!started ? (
        <button
          className={`mb-6 px-4 py-2 rounded ${completed ? 'bg-green-700/60 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}
          onClick={() => setStarted(true)}
          disabled={completed}
        >
          {completed ? 'Completed' : 'Start Mission'}
        </button>
      ) : null}
      {completed && !started ? (
        <div className="mb-4 text-xs text-green-300">✅ Completed</div>
      ) : null}
      {started ? (
        <div className="mb-6">
          <div className="text-cyan-300 font-semibold mb-2">Steps</div>
          <ol className="list-decimal ml-5 space-y-3 text-sm">
            {activeMission.steps.map((step) => (
              <li key={step.id}>
                <div className="mb-2">{step.prompt}</div>
                {step.inputType === 'choice' ? (
                  <select
                    className="w-full px-3 py-2 bg-black/50 border border-cyan-600 rounded text-cyan-100"
                    value={answers[step.id] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [step.id]: e.target.value }))}
                  >
                    <option value="">Select...</option>
                    {(step.choices || []).map((choice) => (
                      <option key={choice} value={choice}>{choice}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={step.inputType === 'number' ? 'number' : 'text'}
                    className="w-full px-3 py-2 bg-black/50 border border-cyan-600 rounded text-cyan-100"
                    value={answers[step.id] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [step.id]: e.target.value }))}
                    placeholder={step.unitLabel ? `Enter value (${step.unitLabel})` : 'Enter response'}
                  />
                )}
              </li>
            ))}
          </ol>
          <button
            className={`mt-4 px-4 py-2 rounded ${completed ? 'bg-green-700/60 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}
            onClick={async () => {
              const firstStep = activeMission.steps[0]
              const payload = firstStep ? { main: answers[firstStep.id] } : { main: null }
              const { pass, feedback } = gradeStemAttempt(activeMission, payload)
              const { missionsRepo, actor } = await getRepos()
              const attempt = {
                missionId: activeMission.id,
                actorId: actor.actorId,
                answers,
                submittedAt: new Date().toISOString(),
              }
              await missionsRepo.saveAttempt(actor.actorId, attempt)
              if (pass) {
                await missionsRepo.markCompleted(actor.actorId, activeMission.id)
                await syncMissionCompletionToActivity(activeMission)
                setCompleted(true)
              }
              setResult({ pass, feedback })
            }}
            disabled={completed}
          >
            {completed ? 'Completed' : 'Submit'}
          </button>
          {result ? (
            <div className={`mt-3 text-sm border rounded p-3 ${result.pass ? 'border-green-700/60 bg-green-900/30 text-green-200' : 'border-red-700/60 bg-red-900/30 text-red-200'}`}>
              {result.feedback}
            </div>
          ) : null}
          {completed ? (
            <div className="mt-2 text-xs text-green-300">✅ Completed</div>
          ) : null}
        </div>
      ) : null}
      {activeMission.requiredData ? (
        <div className="text-sm">
          <div className="text-cyan-300 font-semibold mb-2">Required Data</div>
          <ul className="list-disc ml-5 space-y-1">
            {Object.entries(activeMission.requiredData).map(([key, value]) => (
              <li key={key}>
                {key}: {value == null ? 'N/A' : String(value)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        className="mt-6 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500"
        onClick={() => nav('/command')}
      >
        Back to Command Center
      </button>
    </div>
  )
}
