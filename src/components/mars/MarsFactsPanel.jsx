// src/components/mars/MarsFactsPanel.jsx
// "Did You Know" facts panel with techy readout styling

import React from 'react'

function FactReadout({ fact, index }) {
  // Generate a "signal strength" based on index for visual variety
  const signalBars = Math.min(4, (index % 4) + 1)
  
  return (
    <div className="bg-zinc-900/50 border border-red-700/30 rounded p-3 hover:border-red-500/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-red-500/70">{fact.id}</span>
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-${i + 1} rounded-sm ${
                i < signalBars ? 'bg-green-500' : 'bg-zinc-700'
              }`}
              style={{ height: `${(i + 1) * 3}px` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xs font-mono text-red-400 tracking-wider">{fact.label}</span>
        <span className="text-sm font-mono text-white font-bold">{fact.value}</span>
      </div>
      
      <p className="text-xs text-red-200/60 font-mono">{fact.description}</p>
    </div>
  )
}

export default function MarsFactsPanel({ facts, loading }) {
  if (loading) {
    return (
      <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            DID YOU KNOW?
          </h2>
        </div>
        <div className="p-4 text-center text-red-300 font-mono animate-pulse">
          LOADING MARS DATA...
        </div>
      </div>
    )
  }

  if (!facts || facts.length === 0) {
    return (
      <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            DID YOU KNOW?
          </h2>
        </div>
        <div className="p-4 text-center text-red-300/70 font-mono">
          FACTS MODULE OFFLINE
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
      <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
              DID YOU KNOW?
            </h2>
            <p className="text-xs text-red-200/70 font-mono">
              MARS SYSTEM READOUTS
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-400">LIVE</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {facts.map((fact, index) => (
          <FactReadout key={fact.id} fact={fact} index={index} />
        ))}
      </div>
    </div>
  )
}
