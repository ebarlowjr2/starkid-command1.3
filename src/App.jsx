import React, { useEffect, useMemo, useState } from 'react'
import MissionCard from './components/MissionCard.jsx'

// NASA + general space info
import { getAPOD, getNEOsToday, getDonkiAlerts, getEPICLatest, getRecentSolarActivity } from './lib/nasa.js'
import { getISSNow, getAstros } from './lib/iss.js'

// SpaceX
import { getLatestLaunch, getUpcomingLaunches, getRockets, getCrew } from './lib/spacex.js'

// Components
import CountdownCard from './components/CountdownCard.jsx'
import CrewGrid from './components/CrewGrid.jsx'
import LaunchDetails from './components/LaunchDetails.jsx'
import SolarStormMeter from './components/SolarStormMeter.jsx'
import EarthView from './components/EarthView.jsx'
import ISSStatus from './components/ISSStatus.jsx'

export default function App(){
  // General space info
  const [neos, setNeos] = useState([])
  const [alerts, setAlerts] = useState([])
  const [apod, setApod] = useState(null)  // kept for future use
  const [epic, setEpic] = useState(null)
  const [solar, setSolar] = useState(null)
  const [issPos, setIssPos] = useState(null)
  const [astros, setAstros] = useState(null)

  // Launch/SpaceX
  const [launch, setLaunch] = useState(null)       // latest (optional)
  const [upcoming, setUpcoming] = useState([])     // next mission = [0]
  const [rockets, setRockets] = useState([])
  const [crew, setCrew] = useState([])

  const [error, setError] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        // batch 1: existing content
        const [a, n, d, l, u, r, c] = await Promise.all([
          getAPOD(),
          getNEOsToday(),
          getDonkiAlerts(),
          getLatestLaunch(),
          getUpcomingLaunches(1),   // next mission (countdown)
          getRockets(),
          getCrew(6)                // roster for right column
        ])
        setApod(a); setNeos(n); setAlerts(d);
        setLaunch(l); setUpcoming(u); setRockets(r); setCrew(c)

        // batch 2: new general info (EPIC, solar, ISS)
        const [ep, so, pos, crewInfo] = await Promise.all([
          getEPICLatest(),
          getRecentSolarActivity(3),
          getISSNow(),
          getAstros()
        ])
        setEpic(ep); setSolar(so); setIssPos(pos); setAstros(crewInfo)

      }catch(e){
        setError(e.message || 'Failed to load data')
      }
    }
    load()
  },[])

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

      <main className="grid gap-4 p-4 grid-cols-1 md:grid-cols-3 auto-rows-max">

        {/* ===== Top Row: 3 general cards ===== */}
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
                <li>Pick a near-Earth object and log its closest approach.</li>
                <li>Check the Solar Storm Meter.</li>
                <li>Report the next mission and its rocket.</li>
              </ol>
            </div>
          }
        />

        {/* ===== General Info Row (under top): Solar/Earth/ISS ===== */}
        <SolarStormMeter summary={solar} />
        <EarthView epic={epic} />
        <ISSStatus position={issPos} astros={astros} />

        {/* ===== Next Mission group: countdown (2 cols) + crew (right) ===== */}
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

        {/* ===== Mission Details: patch + rocket info ===== */}
        <div className="md:col-span-2">
          <LaunchDetails launch={nextLaunch} rocket={nextRocket} />
        </div>

      </main>

      <footer className="p-4 text-center opacity-75 text-xs">
        Built with NASA + SpaceX public APIs. For kids & learning.
      </footer>
    </div>
  )
}
