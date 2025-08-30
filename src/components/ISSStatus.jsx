import React from 'react'

export default function ISSStatus({ position, astros }){
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900 h-full">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">ISS Status</h2>
        <span className="text-cyan-400 text-xs">Open Notify</span>
      </div>

      {!position || !astros ? (
        <div className="text-sm">Loading ISS data…</div>
      ) : (
        <div className="text-sm text-cyan-100 space-y-2">
          <div className="opacity-90">
            Lat/Lon: {position.latitude?.toFixed(2)}, {position.longitude?.toFixed(2)}
            <div className="text-xs opacity-70">Updated: {position.timestamp ? new Date(position.timestamp).toLocaleString() : '—'}</div>
          </div>
          <div>
            <div className="opacity-90">Crew aboard ISS: <b>{astros.iss.length}</b></div>
            <ul className="text-xs opacity-80 mt-1 space-y-1">
              {astros.iss.map((p,i)=> (<li key={i}>• {p.name}</li>))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
