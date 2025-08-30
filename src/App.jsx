import React, { useEffect, useState } from 'react'
import MissionCard from './components/MissionCard.jsx'
import { getAPOD, getNEOsToday, getDonkiAlerts } from './lib/nasa.js'
import { getLatestLaunch } from './lib/spacex.js'

export default function App(){
  const [apod, setApod] = useState(null)
  const [neos, setNeos] = useState([])
  const [alerts, setAlerts] = useState([])
  const [launch, setLaunch] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const [a, n, d, l] = await Promise.all([
          getAPOD(), getNEOsToday(), getDonkiAlerts(), getLatestLaunch()
        ])
        setApod(a); setNeos(n); setAlerts(d); setLaunch(l)
      }catch(e){ setError(e.message) }
    }
    load()
  },[])

  return (
    <div className="min-h-screen text-cyan-200 font-mono">
      <header className="p-4 lcars shadow-neon">
        <h1 className="text-3xl">STAR<span className="text-cyan-400">KID</span> COMMAND</h1>
        <p className="text-sm">Junior Science Officer Mission Console</p>
      </header>

      {error && <p className="p-4 text-red-400">{error}</p>}

      <main className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        <MissionCard title="Astronomy Picture of the Day" subtitle="APOD" 
          content={apod ? (<div>
            <p className="text-sm mb-2">{apod.title}</p>
            {apod.media_type === 'image' && <img src={apod.url} alt={apod.title} className="rounded" />}
            {apod.media_type === 'video' && <a href={apod.url} target="_blank" rel="noreferrer" className="underline">Watch</a>}
          </div>) : 'Loading...'} />

        <MissionCard title="Asteroid Flybys Today" subtitle="NEO Scout"
          content={neos.length ? (
            <ul className="text-xs space-y-1">
              {neos.slice(0,5).map((o,i)=> (
                <li key={i}>• {o.name} — {o.close_approach_date_full} — {Number(o.miss_distance_km).toLocaleString()} km</li>
              ))}
            </ul>
          ) : 'Loading...'} />

        <MissionCard title="Space Weather" subtitle="DONKI Alerts"
          content={alerts.length ? (
            <ul className="text-xs space-y-1">
              {alerts.slice(0,5).map((a,i)=> (<li key={i}>• {a.messageType} — {new Date(a.messageIssueTime).toLocaleString()}</li>))}
            </ul>
          ) : 'Loading...'} />

        <MissionCard title="Latest Launch" subtitle="SpaceX"
          content={launch ? (
            <div className="text-sm">
              <p>{launch.name}</p>
              <p className="text-xs opacity-80">{new Date(launch.date_utc).toLocaleString()}</p>
              {launch.links?.patch?.small && <img className="mt-2 w-28" src={launch.links.patch.small} alt="patch" />}
              {launch.links?.webcast && <a className="underline block mt-2" href={launch.links.webcast} target="_blank" rel="noreferrer">Watch Webcast</a>}
            </div>
          ) : 'Loading...'} />

        <MissionCard title="Daily Briefing" subtitle="Your Orders"
          content={<div className="text-sm">
            <ol className="list-decimal ml-5 space-y-1">
              <li>Identify today’s APOD subject and draw it.</li>
              <li>Pick one near-Earth object and log its closest approach.</li>
              <li>Check if there are any solar storm alerts.</li>
              <li>Report the latest launch and its mission.</li>
            </ol>
          </div>} />
      </main>

      <footer className="p-4 text-center opacity-75 text-xs">
        Built with NASA + SpaceX public APIs. For kids & learning.
      </footer>
    </div>
  )
}
