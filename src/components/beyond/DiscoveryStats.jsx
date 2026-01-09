// src/components/beyond/DiscoveryStats.jsx
// Discovery statistics cards for Beyond Our Solar System page

import React from 'react'

export default function DiscoveryStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-900/80 border border-cyan-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-cyan-900/50 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-cyan-900/50 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: 'CONFIRMED_EXOPLANETS',
      value: stats.totalConfirmed.toLocaleString(),
      sublabel: 'Verified discoveries',
      color: 'cyan'
    },
    {
      label: 'EARTH_SIZED_CANDIDATES',
      value: stats.earthSizedCount.toLocaleString(),
      sublabel: 'Radius 0.8–1.5 Earth',
      color: 'green'
    },
    {
      label: 'CLOSEST_DISCOVERED_WORLD',
      value: stats.closestWorld ? `${stats.closestWorld.distanceLightYears} ly` : 'N/A',
      sublabel: stats.closestWorld?.name || 'Unknown',
      color: 'amber'
    }
  ]

  const colorClasses = {
    cyan: {
      border: 'border-cyan-500/50',
      glow: 'shadow-cyan-500/20',
      text: 'text-cyan-400',
      value: 'text-cyan-300'
    },
    green: {
      border: 'border-green-500/50',
      glow: 'shadow-green-500/20',
      text: 'text-green-400',
      value: 'text-green-300'
    },
    amber: {
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
      text: 'text-amber-400',
      value: 'text-amber-300'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((card, index) => {
        const colors = colorClasses[card.color]
        return (
          <div
            key={index}
            className={`
              bg-gray-900/80 border ${colors.border} rounded-lg p-4
              shadow-lg ${colors.glow}
            `}
          >
            <div className={`text-xs font-mono ${colors.text} mb-1 tracking-wider`}>
              {card.label}
            </div>
            <div className={`text-3xl font-bold ${colors.value} font-mono`}>
              {card.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {card.sublabel}
            </div>
          </div>
        )
      })}
    </div>
  )
}
