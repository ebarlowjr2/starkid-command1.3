import React from 'react'

export default function EarthView({ epic }){
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">Today’s Earth</h2>
        <span className="text-cyan-400 text-xs">DSCOVR / EPIC</span>
      </div>
      {!epic ? (
        <div className="text-sm">Loading Earth image…</div>
      ) : (
        <div className="text-cyan-100">
          <img src={epic.imageUrl} alt="EPIC Earth" className="rounded mb-2" />
          <div className="text-xs opacity-80">
            {new Date(epic.date).toLocaleString()} UTC
          </div>
        </div>
      )}
    </section>
  )
}
