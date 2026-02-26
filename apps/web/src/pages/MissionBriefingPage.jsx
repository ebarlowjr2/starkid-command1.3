import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getMission } from '../state/missionStore.js'

export default function MissionBriefingPage() {
  const nav = useNavigate()
  const mission = getMission()

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
