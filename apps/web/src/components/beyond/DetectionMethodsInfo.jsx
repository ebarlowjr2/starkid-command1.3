// src/components/beyond/DetectionMethodsInfo.jsx
// Educational panel explaining how exoplanets are detected

import React from 'react'

export default function DetectionMethodsInfo({ methods }) {
  return (
    <div className="bg-gray-900/80 border border-purple-800/50 rounded-lg p-4 mb-6 shadow-lg shadow-purple-500/10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-purple-400 text-lg">?</span>
        <h2 className="text-lg font-mono text-purple-400 tracking-wider">
          HOW_WE_FIND_PLANETS_WITHOUT_GOING_THERE
        </h2>
      </div>

      <div className="text-xs text-gray-400 mb-4 border-l-2 border-purple-700/50 pl-3">
        We cannot send spacecraft to exoplanets — they are too far away. Instead, 
        scientists use clever techniques to detect planets orbiting distant stars 
        by observing changes in starlight.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="bg-black/40 border border-purple-900/50 rounded p-3 hover:border-purple-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-400 text-xl font-mono">{method.icon}</span>
              <span className="text-purple-300 font-mono text-sm tracking-wide">
                {method.name.toUpperCase().replace(/ /g, '_')}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {method.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-800/30 rounded">
        <div className="flex items-start gap-2">
          <span className="text-purple-500 text-sm">!</span>
          <div>
            <div className="text-xs text-purple-400 font-mono mb-1">IMPORTANT_NOTE</div>
            <p className="text-xs text-gray-400">
              No spacecraft has ever visited an exoplanet. The closest known exoplanet 
              is over 4 light-years away — it would take tens of thousands of years to 
              reach with current technology. All our knowledge comes from studying 
              starlight from Earth and space telescopes.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 font-mono">
        DATA_SOURCE: NASA_EXOPLANET_ARCHIVE | UPDATE_CYCLE: DAILY
      </div>
    </div>
  )
}
