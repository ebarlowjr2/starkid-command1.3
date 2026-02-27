import React from 'react'

export default function CrewGrid({ crew = [] }){
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">Crew Roster</h2>
        <span className="text-cyan-400 text-xs">Human Spaceflight</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {crew.map(c=>(
          <div key={c.id} className="p-2 text-xs rounded border border-cyan-500/40">
            <div className="flex items-center gap-2">
              {c.image && <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded" />}
              <div>
                <div className="text-sm">{c.name}</div>
                <div className="opacity-75">{c.agency || '—'}</div>
              </div>
            </div>
            {c.wikipedia && <a className="underline mt-1 inline-block" href={c.wikipedia} target="_blank" rel="noreferrer">Wikipedia</a>}
            <div className="opacity-70 mt-1">Status: {c.status}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
