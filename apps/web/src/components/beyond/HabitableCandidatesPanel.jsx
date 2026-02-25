// src/components/beyond/HabitableCandidatesPanel.jsx
// Panel showing closest potentially habitable exoplanets

import React from 'react'

export default function HabitableCandidatesPanel({ candidates, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-900/80 border border-green-800/50 rounded-lg p-4 mb-6">
        <div className="h-4 bg-green-900/50 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-green-900/30 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/80 border border-green-800/50 rounded-lg p-4 mb-6 shadow-lg shadow-green-500/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-green-400 tracking-wider">
          CLOSEST_POTENTIALLY_HABITABLE_WORLDS
        </h2>
        <span className="text-xs text-green-500/70 font-mono">
          DISTANCE &lt; 50 LY
        </span>
      </div>

      <div className="text-xs text-gray-400 mb-4 border-l-2 border-green-700/50 pl-3">
        Potentially habitable does not mean inhabited. These worlds have conditions 
        that might support liquid water based on their size and temperature.
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 font-mono text-sm">
          NO_CANDIDATES_MATCHING_CRITERIA
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((planet, index) => (
            <div
              key={planet.name}
              className="bg-black/40 border border-green-900/50 rounded p-3 hover:border-green-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-mono">
                      [{String(index + 1).padStart(2, '0')}]
                    </span>
                    <span className="text-green-300 font-bold tracking-wide">
                      {planet.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Host: {planet.hostStar}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-mono text-sm">
                    {planet.distanceLightYears} ly
                  </div>
                  <div className="text-xs text-gray-500">
                    {planet.radiusEarth}x Earth
                  </div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">STAR_TYPE:</span>
                  <span className="text-gray-300 ml-1">{planet.starType.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-gray-500">DISCOVERY:</span>
                  <span className="text-gray-300 ml-1">{planet.discoveryMethod}</span>
                </div>
                <div>
                  <span className="text-gray-500">TEMP:</span>
                  <span className="text-gray-300 ml-1">
                    {planet.equilibriumTemp ? `${planet.equilibriumTemp}K` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-green-700">STATUS:</span>
                <span className="text-xs text-green-500 font-mono animate-pulse">
                  POTENTIAL_HABITABILITY
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
