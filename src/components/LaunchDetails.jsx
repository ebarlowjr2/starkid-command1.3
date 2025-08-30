import React from 'react'

export default function LaunchDetails({ launch, rocket }) {
  if (!launch) return null
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900 h-full">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">Mission Details</h2>
        <span className="text-cyan-400 text-xs">SpaceX</span>
      </div>

      <div className="text-sm text-cyan-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Patch */}
        <div className="flex flex-col items-center">
          {launch.links?.patch?.small ? (
            <img className="w-28" src={launch.links.patch.small} alt="Mission patch" />
          ) : (
            <div className="w-28 h-28 border border-cyan-500/40 rounded grid place-items-center text-xs opacity-70">
              No Patch
            </div>
          )}
          <span className="mt-2 text-xs opacity-80">{launch.name}</span>
        </div>

        {/* Rocket */}
        <div className="md:col-span-2">
          <div className="text-base">{rocket?.name || 'Rocket TBD'}</div>
          {rocket && (
            <ul className="mt-1 text-xs space-y-1 opacity-90">
              <li>First flight: {rocket.first_flight}</li>
              <li>Stages: {rocket.stages} • Boosters: {rocket.boosters}</li>
              <li>Height: {rocket.height?.meters} m • Diameter: {rocket.diameter?.meters} m</li>
              <li>Mass: {rocket.mass?.kg?.toLocaleString()} kg</li>
              <li>Engines: {rocket.engines?.type} {rocket.engines?.version} • Sea-level thrust: {rocket.engines?.thrust_sea_level?.kN} kN</li>
            </ul>
          )}
          {launch.links?.webcast && (
            <a
              href={launch.links.webcast}
              target="_blank"
              rel="noreferrer"
              className="underline inline-block mt-2"
            >
              Watch Webcast
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
