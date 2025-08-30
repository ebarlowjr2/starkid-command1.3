import React, { useEffect, useState, useMemo } from 'react'
import MissionCard from './components/MissionCard.jsx'
import { getAPOD, getNEOsToday, getDonkiAlerts } from './lib/nasa.js'
import { getLatestLaunch, getUpcomingLaunches, getRockets, getCrew } from './lib/spacex.js'
import CountdownCard from './components/CountdownCard.jsx'
import CrewGrid from './components/CrewGrid.jsx'
import LaunchDetails from './components/LaunchDetails.jsx'

export default function App(){
  // General space info
  const [neos, setNeos] = useState([])
  const [alerts, setAlerts] = useState([])
  const [apod, setApod] = useState(null) // kept for future, not top-priority in layout

  // Launch/SpaceX
  const [launch, setLaunch] = useState(null)        // latest (kept if you want elsewhere)
  const [upcoming, setUpcoming] = useState([])      // we use [0] as “Next Mission”
  const [rockets, setRockets] = useState([])
  const [crew, setCrew] = useState([])

  const [error, setError] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const [a, n, d, l, u, r, c] = await Promise.all([
          getAPOD(),
          getNEOsToday(),
          getDonkiAlerts(),
          getLatestLaunch(),
          getUpcomingLaunches(1),   // next mission
          getRockets(),
          getCrew(6)                // small roster for right rail
        ])
        setApod(a); setNeos(n); setAlerts(d);
        setLaunch(l); setUpcoming(u); setRockets(r); setCrew(c)
      }catch(e){ setError(e.message || 'Failed to load data') }
    }
    load()
  },[])

  // Find the rocket object for the next mission (if available)
  const nextLaunch = upcoming?.[0] || null
  const nextRocket = useMemo(() => {
    if (!nextLaunch || !rockets?.length) return null
    return rockets.find(r => r.id === nextLaunch.rocket) || null
  }, [nextLaunch, rockets])

  return (
    <div className="min-h-screen text-cyan-200 font-mono">
      <header className="p-4 lcars shadow-neon">
        <h1 className="text-3xl">STAR<span className="text-cyan-400">KID</span> COMMAND</h1>
        <p className="text-sm">Junior Science Officer Dashboard</p>
      </header>

      {error && <p className="p-4 text-red-400">{error}</p>}

      {/* DASH LAYOUT */}
      <main className="grid gap-4 p-4
                       grid-cols-1
                       md:grid-cols-3
                       auto-rows-max">

        {/* ===== Top Row (3 cards) ===== */}
        <MissionCard
          title="Asteroid Flybys Today"
          subtitle="NEO Scout"
          content={
            neos.length ? (
              <ul className="text-xs space-y-1">
                {neos.slice(0,5).map((o,i)=> (
                  <li key={i}>• {o.name} — {o.close_approach_date_full} — {Number(o.miss_distance_km).toLocaleString()} km</li>
                ))}
              </ul>
            ) : 'Loading...'
          }
        />

        <MissionCard
          title="Space Weather"
          subtitle="DONKI Alerts"
          content={
            alerts.length ? (
              <ul className="text-xs space-y-1">
                {alerts.slice(0,5).map((a,i)=> (
                  <li key={i}>• {a.messageType} — {new Date(a.messageIssueTime).toLocaleString()}</li>
                ))}
              </ul>
            ) : 'Loading...'
          }
        />

        <MissionCard
          title="Daily Briefing"
          subtitle="Your Orders"
          content={
            <div className="text-sm">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Identify today’s APOD subject and draw it.</li>
                <li>Pick one near-Earth object and log its closest approach.</li>
                <li>Check if there are any solar storm alerts.</li>
                <li>Report the next mission and its rocket.</li>
              </ol>
            </div>
          }
        />

        {/* ===== Row 2: Next Mission (span 2) + Crew (right) ===== */}
        <div className="md:col-span-2">
          {nextLaunch ? (
            <CountdownCard launch={nextLaunch} />
          ) : (
            <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
              <div className="text-sm">Loading next mission…</div>
            </section>
          )}
        </div>

        <div className="md:col-span-1">
          <CrewGrid crew={crew} />
        </div>

        {/* ===== Row 3: Mission patch + rocket details (span full width on mobile, 2 cols on md+) ===== */}
        <div className="md:col-span-2">
          <LaunchDetails launch={nextLaunch} rocket={nextRocket} />
        </div>

        {/* Optional extra: keep latest launch somewhere (hidden for now)
        <MissionCard
          title="Latest Launch"
          subtitle="SpaceX"
          content={
            launch ? (
              <div className="text-sm">
                <p>{launch.name}</p>
                <p className="text-xs opacity-80">{new Date(launch.date_utc).toLocaleString()}</p>
                {launch.links?.patch?.small && <img className="mt-2 w-28" src={launch.links.patch.small} alt="patch" />}
                {launch.links?.webcast && <a className="underline block mt-2" href={launch.links.webcast} target="_blank" rel="noreferrer">Watch Webcast</a>}
              </div>
            ) : 'Loading...'
          }
        />
        */}

        {/* Optional: show APOD somewhere lower if you want */}
        {/* <MissionCard
          title="Astronomy Picture of the Day"
          subtitle="APOD"
          content={
            apod ? (
              <div>
                <p className="text-sm mb-2">{apod.title}</p>
                {apod.media_type === 'image' && <img src={apod.url} alt={apod.title} className="rounded" />}
                {apod.media_type === 'video' && <a href={apod.url} target="_blank" rel="noreferrer" className="underline">Watch</a>}
              </div>
            ) : 'Loading...'
          }
        /> */}

      </main>

      <footer className="p-4 text-center opacity-75 text-xs">
        Built with NASA + SpaceX public APIs. For kids & learning.
      </footer>
    </div>
  )
}
