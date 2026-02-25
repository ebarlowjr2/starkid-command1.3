// src/components/mars/TelemetryGrid.jsx
// Grid display of Mars rover telemetry data

import React from 'react'

function TelemetryItem({ label, value, status }) {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-red-500',
    unknown: 'bg-yellow-500'
  }

  return (
    <div className="bg-zinc-900/50 border border-red-700/50 rounded p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-red-400 tracking-wider">{label}</span>
        {status && (
          <span className={`w-2 h-2 rounded-full ${statusColors[status] || statusColors.unknown}`} />
        )}
      </div>
      <div className="text-sm font-mono text-white">{value || 'N/A'}</div>
    </div>
  )
}

export default function TelemetryGrid({ telemetry, loading }) {
  if (loading) {
    return (
      <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            MISSION TELEMETRY
          </h2>
        </div>
        <div className="p-4 text-center text-red-300 font-mono animate-pulse">
          ACQUIRING TELEMETRY...
        </div>
      </div>
    )
  }

  if (!telemetry) {
    return (
      <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            MISSION TELEMETRY
          </h2>
        </div>
        <div className="p-4 text-center text-red-300 font-mono">
          NO TELEMETRY DATA
        </div>
      </div>
    )
  }

  const roverStatus = telemetry.roverStatus?.toLowerCase()
  const statusIndicator = roverStatus === 'active' ? 'active' : 'inactive'

  return (
    <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
      <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
        <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
          MISSION TELEMETRY
        </h2>
        <p className="text-xs text-red-200/70 font-mono">
          {telemetry.roverName} ROVER DATA STREAM
        </p>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-3">
        <TelemetryItem 
          label="ROVER_STATUS" 
          value={telemetry.roverStatus?.toUpperCase()} 
          status={statusIndicator}
        />
        <TelemetryItem 
          label="CURRENT_SOL" 
          value={telemetry.currentSol?.toLocaleString()} 
        />
        <TelemetryItem 
          label="EARTH_DATE" 
          value={telemetry.earthDate} 
        />
        <TelemetryItem 
          label="CAMERA" 
          value={telemetry.cameraName} 
        />
        <TelemetryItem 
          label="LANDING_DATE" 
          value={telemetry.landingDate} 
        />
        <TelemetryItem 
          label="LAUNCH_DATE" 
          value={telemetry.launchDate} 
        />
        <TelemetryItem 
          label="MAX_SOL" 
          value={telemetry.maxSol?.toLocaleString()} 
        />
        <TelemetryItem 
          label="TOTAL_PHOTOS" 
          value={telemetry.totalPhotos?.toLocaleString()} 
        />
      </div>
    </div>
  )
}
