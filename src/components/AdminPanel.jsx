import React from 'react'

export default function AdminPanel({ launches = [], currentMission = null }) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-cyan-500 rounded-lg p-4 shadow-lg shadow-cyan-500/50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2 tracking-wider">
          MISSION CONTROL
        </h2>
        <div className="h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
      </div>

      {currentMission && (
        <div className="mb-6 p-4 bg-zinc-900/50 border border-cyan-600 rounded">
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">
            CURRENT MISSION
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cyan-200">Mission:</span>
              <span className="text-white font-medium">{currentMission.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-200">Status:</span>
              <span className="text-green-400 font-medium">{currentMission.status?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-200">Vehicle:</span>
              <span className="text-white">{currentMission.rocket?.configuration?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-200">Launch Time:</span>
              <span className="text-white">
                {currentMission.net ? new Date(currentMission.net).toLocaleString() : 'TBD'}
              </span>
            </div>
            {currentMission.mission && (
              <div className="mt-2 pt-2 border-t border-cyan-800">
                <span className="text-cyan-200">Destination:</span>
                <p className="text-white mt-1">{currentMission.mission.description || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
