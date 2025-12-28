// src/pages/planets/MarsCommandCenterPage.jsx
// Mars mini command center with rover photos, telemetry, weather, and facts

import React from 'react'
import { Link } from 'react-router-dom'
import useMarsCommandCenter from './hooks/useMarsCommandCenter.js'
import RoverPhotoCard from '../../components/mars/RoverPhotoCard.jsx'
import TelemetryGrid from '../../components/mars/TelemetryGrid.jsx'
import WeatherCard from '../../components/mars/WeatherCard.jsx'
import MarsFactsPanel from '../../components/mars/MarsFactsPanel.jsx'

export default function MarsCommandCenterPage() {
  const { loading, error, photoOfDay, telemetry, weather, facts, refresh } = useMarsCommandCenter()

  return (
    <div className="p-4 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Link 
            to="/planets" 
            className="text-red-400 hover:text-red-300 text-sm font-mono"
          >
            ← PLANETS
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-red-400 font-mono">
              MARS <span className="text-white">//</span> COMMAND CENTER
            </h1>
            <p className="text-sm text-red-200/70 font-mono mt-1">
              Daily rover capture • Sol & mission telemetry • Facts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-xs font-mono text-red-300">
              {loading ? 'SYNCING' : error ? 'ERROR' : 'CONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border-l-4 border-red-500 text-red-200 font-mono">
          <p className="font-semibold text-sm">SYSTEM ALERT:</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column - Photo hero */}
        <div className="lg:col-span-2">
          <RoverPhotoCard 
            photo={photoOfDay} 
            telemetry={telemetry} 
            onRefresh={refresh}
            loading={loading}
          />
        </div>

        {/* Telemetry grid */}
        <div>
          <TelemetryGrid telemetry={telemetry} loading={loading} />
        </div>

        {/* Weather card */}
        <div>
          <WeatherCard weather={weather} loading={loading} />
        </div>

        {/* Facts panel - full width */}
        <div className="lg:col-span-2">
          <MarsFactsPanel facts={facts} loading={loading} />
        </div>
      </div>
    </div>
  )
}
