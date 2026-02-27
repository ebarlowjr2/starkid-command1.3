// src/components/mars/WeatherCard.jsx
// Mars weather status card - handles both official (offline) and community modes

import React from 'react'

export default function WeatherCard({ weather, loading }) {
  if (loading) {
    return (
      <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            SURFACE WEATHER
          </h2>
        </div>
        <div className="p-4 text-center text-red-300 font-mono animate-pulse">
          CHECKING WEATHER SYSTEMS...
        </div>
      </div>
    )
  }

  const isAvailable = weather?.available

  return (
    <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
      <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            SURFACE WEATHER
          </h2>
          <p className="text-xs text-red-200/70 font-mono">
            MARS ATMOSPHERIC DATA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-xs font-mono text-red-300">
            {isAvailable ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {!isAvailable ? (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-sm font-mono">⚠ WEATHER_STATUS</span>
              </div>
              <p className="text-xs text-yellow-200/80 font-mono leading-relaxed">
                {weather?.message || 'Live surface weather data is not currently available.'}
              </p>
            </div>
            
            {/* Show general Mars conditions context */}
            <div className="text-xs font-mono text-red-200/70">
              <p className="mb-2 text-red-400">MARS CONDITIONS CONTEXT:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-900/50 p-2 rounded">
                  <span className="text-red-400">AVG_TEMP:</span>
                  <span className="text-white ml-2">-60°C</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded">
                  <span className="text-red-400">PRESSURE:</span>
                  <span className="text-white ml-2">~600 Pa</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded">
                  <span className="text-red-400">ATMOSPHERE:</span>
                  <span className="text-white ml-2">95% CO₂</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded">
                  <span className="text-red-400">DAY_LENGTH:</span>
                  <span className="text-white ml-2">24h 39m</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Placeholder for when weather data is available */}
            <div className="bg-zinc-900/50 border border-red-700/50 rounded p-3">
              <span className="text-xs font-mono text-red-400">TEMPERATURE</span>
              <div className="text-lg font-mono text-white">{weather.temperature || 'N/A'}</div>
            </div>
            <div className="bg-zinc-900/50 border border-red-700/50 rounded p-3">
              <span className="text-xs font-mono text-red-400">PRESSURE</span>
              <div className="text-lg font-mono text-white">{weather.pressure || 'N/A'}</div>
            </div>
            <div className="bg-zinc-900/50 border border-red-700/50 rounded p-3">
              <span className="text-xs font-mono text-red-400">WIND_SPEED</span>
              <div className="text-lg font-mono text-white">{weather.windSpeed || 'N/A'}</div>
            </div>
            <div className="bg-zinc-900/50 border border-red-700/50 rounded p-3">
              <span className="text-xs font-mono text-red-400">SEASON</span>
              <div className="text-lg font-mono text-white">{weather.season || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
