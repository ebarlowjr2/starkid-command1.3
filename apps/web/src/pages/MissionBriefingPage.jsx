import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMission } from '../state/missionStore.js'
import { gradeAttempt, getRepos } from '@starkid/core'

export default function MissionBriefingPage() {
  const nav = useNavigate()
  const mission = getMission()
  const [started, setStarted] = useState(false)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)

  if (!mission) {
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
      <h1 className="text-2xl font-semibold mb-2">{mission.title}</h1>
      <div className="text-sm text-cyan-200 mb-4">
        {mission.type} • {mission.difficulty}
      </div>
      <p className="text-sm mb-4">{mission.briefing}</p>
      {!started ? (
        <button
          className="mb-6 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500"
          onClick={() => setStarted(true)}
        >
          Start Mission
        </button>
      ) : null}
      {started ? (
        <div className="mb-6">
          <div className="text-cyan-300 font-semibold mb-2">Steps</div>
          <ol className="list-decimal ml-5 space-y-1 text-sm">
            {(mission.steps || []).map((step) => (
              <li key={step.id}>{step.prompt}</li>
            ))}
          </ol>
          <div className="mt-4 text-sm">
            <label className="block text-cyan-300 mb-1">Response</label>
            <input
              className="w-full px-3 py-2 bg-black/50 border border-cyan-600 rounded text-cyan-100"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your response (e.g., acknowledged)"
            />
          </div>
          <button
            className="mt-4 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500"
            onClick={async () => {
              const { pass, feedback } = gradeAttempt(mission, { main: answer })
              const { missionsRepo, actor } = await getRepos()
              const attempt = {
                missionId: mission.id,
                actorId: actor.actorId,
                answers: { main: answer },
                submittedAt: new Date().toISOString(),
                result: pass ? 'pass' : 'fail',
                feedback,
              }
              await missionsRepo.saveAttempt(actor.actorId, attempt)
              if (pass) {
                await missionsRepo.markCompleted(actor.actorId, mission.id)
              }
              setResult({ pass, feedback })
            }}
          >
            Submit
          </button>
          {result ? (
            <div className={`mt-3 text-sm ${result.pass ? 'text-green-300' : 'text-red-300'}`}>
              {result.feedback}
            </div>
          ) : null}
        </div>
      ) : null}
      {mission.requiredData ? (
        <div className="text-sm">
          <div className="text-cyan-300 font-semibold mb-2">Required Data</div>
          <ul className="list-disc ml-5 space-y-1">
            {Object.entries(mission.requiredData).map(([key, value]) => (
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
