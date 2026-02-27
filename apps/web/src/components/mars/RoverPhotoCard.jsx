// src/components/mars/RoverPhotoCard.jsx
// Hero card displaying the daily rover photo

import React from 'react'

export default function RoverPhotoCard({ photo, telemetry, onRefresh, loading }) {
  if (!photo && !loading) {
    return (
      <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600">
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            DAILY ROVER CAPTURE
          </h2>
        </div>
        <div className="p-6 text-center text-red-300">
          <p>No rover photo available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-red-500 rounded-lg overflow-hidden shadow-lg shadow-red-500/30 bg-black">
      <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-red-600 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-red-300 tracking-wider font-mono">
            DAILY ROVER CAPTURE
          </h2>
          <p className="text-xs text-red-200/70 font-mono">
            {telemetry?.roverName || 'ROVER'} // {telemetry?.cameraFullName || 'CAMERA'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 text-xs font-mono bg-red-900/50 border border-red-500 rounded 
                   text-red-300 hover:bg-red-800/50 transition-colors disabled:opacity-50"
        >
          {loading ? 'LOADING...' : 'REFRESH'}
        </button>
      </div>
      
      <div className="relative">
        {loading ? (
          <div className="h-64 flex items-center justify-center bg-zinc-900">
            <div className="text-red-400 animate-pulse font-mono">ACQUIRING IMAGE...</div>
          </div>
        ) : (
          <img
            src={photo?.img_src}
            alt={`Mars rover photo from ${telemetry?.earthDate}`}
            className="w-full h-auto max-h-[500px] object-contain bg-zinc-900"
          />
        )}
        
        {/* Overlay info bar */}
        {!loading && telemetry && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex justify-between items-center">
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-red-400">
                SOL: <span className="text-white">{telemetry.currentSol}</span>
              </span>
              <span className="text-red-400">
                EARTH: <span className="text-white">{telemetry.earthDate}</span>
              </span>
            </div>
            <span className="text-xs font-mono text-red-300">
              ID: {telemetry.photoId}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
