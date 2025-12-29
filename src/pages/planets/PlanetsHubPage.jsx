// src/pages/planets/PlanetsHubPage.jsx
// Planet picker page - hub for visiting different planets

import React from 'react'
import { useNavigate } from 'react-router-dom'

const PLANETS = [
  { 
    id: 'mars', 
    name: 'Mars', 
    subtitle: 'Planet Command Center',
    status: 'live',
    color: 'from-red-900 to-orange-900',
    borderColor: 'border-red-500',
    glowColor: 'shadow-red-500/50'
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    subtitle: 'Coming Soon',
    status: 'locked',
    color: 'from-yellow-900 to-amber-900',
    borderColor: 'border-yellow-700',
    glowColor: 'shadow-yellow-700/30'
  },
  { 
    id: 'jupiter', 
    name: 'Jupiter', 
    subtitle: 'Coming Soon',
    status: 'locked',
    color: 'from-orange-900 to-amber-800',
    borderColor: 'border-orange-700',
    glowColor: 'shadow-orange-700/30'
  },
  { 
    id: 'saturn', 
    name: 'Saturn', 
    subtitle: 'Coming Soon',
    status: 'locked',
    color: 'from-amber-800 to-yellow-900',
    borderColor: 'border-amber-700',
    glowColor: 'shadow-amber-700/30'
  }
]

export default function PlanetsHubPage() {
  const navigate = useNavigate()

  const handlePlanetClick = (planet) => {
    if (planet.status === 'live') {
      navigate(`/planets/${planet.id}`)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-cyan-300 mb-2">
          VISIT ANOTHER PLANET
        </h1>
        <p className="text-sm text-cyan-200/70">
          Select a destination to explore planetary command centers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANETS.map((planet) => (
          <div
            key={planet.id}
            onClick={() => handlePlanetClick(planet)}
            className={`
              relative overflow-hidden rounded-lg border-2 
              ${planet.borderColor} 
              bg-gradient-to-br ${planet.color}
              shadow-lg ${planet.glowColor}
              transition-all duration-300
              ${planet.status === 'live' 
                ? 'cursor-pointer hover:scale-105 hover:shadow-xl' 
                : 'cursor-not-allowed opacity-60'
              }
            `}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-wider text-white">
                  {planet.name.toUpperCase()}
                </h2>
                {planet.status === 'locked' && (
                  <span className="text-xs px-2 py-1 bg-black/50 rounded text-gray-400 font-mono">
                    LOCKED
                  </span>
                )}
                {planet.status === 'live' && (
                  <span className="text-xs px-2 py-1 bg-green-900/50 rounded text-green-400 font-mono animate-pulse">
                    ONLINE
                  </span>
                )}
              </div>
              
              <p className="text-sm text-white/80 mb-4">
                {planet.subtitle}
              </p>

              {planet.status === 'live' && (
                <button
                  className="w-full py-2 px-4 bg-black/40 border border-white/30 rounded 
                           text-white font-mono text-sm tracking-wider
                           hover:bg-white/10 transition-colors"
                >
                  INITIATE MISSION
                </button>
              )}

              {planet.status === 'locked' && (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-black/40 border border-gray-700 rounded 
                           text-gray-500 font-mono text-sm tracking-wider cursor-not-allowed"
                >
                  SYSTEMS OFFLINE
                </button>
              )}
            </div>

            {/* Decorative planet circle */}
            <div 
              className={`
                absolute -bottom-10 -right-10 w-32 h-32 rounded-full 
                bg-gradient-to-br ${planet.color} opacity-30 blur-sm
              `}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
