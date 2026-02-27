import React from 'react'

export default function RocketSpecs({ rockets = [] }){
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">Rocket Specs</h2>
        <span className="text-cyan-400 text-xs">Falcon & Starship</span>
      </div>
      <div className="text-cyan-100">
        <ul className="space-y-2 text-xs">
          {rockets.map(r=>(
            <li key={r.id} className="p-2 rounded border border-cyan-500/40">
              <div className="text-sm">{r.name}</div>
              <div className="opacity-80">
                Stages: {r.stages} • Boosters: {r.boosters} • First flight: {r.first_flight}
              </div>
              <div className="opacity-80">
                Height: {r.height?.meters} m • Diameter: {r.diameter?.meters} m • Mass: {r.mass?.kg?.toLocaleString()} kg
              </div>
              <div className="opacity-70">
                Engines: {r.engines?.type} {r.engines?.version} • Thrust: {r.engines?.thrust_sea_level?.kN} kN
              </div>
              {r.flickr_images?.[0] && <img className="mt-2 rounded" src={r.flickr_images[0]} alt={r.name} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
