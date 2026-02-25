/**
 * CommandCenterPage - Main dashboard with launch tracking, NASA data, etc.
 * (Extracted from the original App.jsx)
 */
import React, { useEffect, useMemo, useState } from 'react'
import Globe from '../components/Globe.jsx'
import AdminPanel from '../components/AdminPanel.jsx'
import MissionCard from '../components/MissionCard.jsx'

import { getUpcomingLaunchesFromLibrary } from '@starkid/core'
import {
  getAPOD,
  getNEOsToday,
  getDonkiAlerts,
  getEPICLatest,
  getRecentSolarActivity,
} from '@starkid/core'
import { getISSNow, getAstros } from '@starkid/core'
import {
  getLatestLaunch,
  getUpcomingLaunches,
  getRockets,
  getCrew,
} from '@starkid/core'

export default function CommandCenterPage() {
  const [launches, setLaunches] = useState([])
  const [launchSites, setLaunchSites] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [neos, setNeos] = useState([])
  const [alerts, setAlerts] = useState([])
  const [apod, setApod] = useState(null)
  const [epic, setEpic] = useState(null)
  const [solar, setSolar] = useState(null)
  const [issPos, setIssPos] = useState(null)
  const [astros, setAstros] = useState(null)

  const [launch, setLaunch] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [rockets, setRockets] = useState([])
  const [crew, setCrew] = useState([])

  useEffect(() => {
    async function loadLaunchData() {
      try {
        setLoading(true)
        const launchData = await getUpcomingLaunchesFromLibrary(20)
        setLaunches(launchData)

        const sites = launchData
          .filter(launch => launch.pad?.latitude && launch.pad?.longitude)
          .map(launch => ({
            name: launch.pad.name || 'Launch Site',
            latitude: launch.pad.latitude,
            longitude: launch.pad.longitude,
            location: launch.pad.location?.name || ''
          }))

        const uniqueSites = sites.filter((site, index, self) =>
          index === self.findIndex(s => 
            s.latitude === site.latitude && s.longitude === site.longitude
          )
        )

        setLaunchSites(uniqueSites)
        setError(null)
      } catch (e) {
        console.error('Error loading launch data:', e)
        setError(e.message || 'Failed to load launch data')
      } finally {
        setLoading(false)
      }
    }

    async function loadNASASpaceXData() {
      try {
        const [a, n, d, l, u, r, c] = await Promise.all([
          getAPOD(),
          getNEOsToday(),
          getDonkiAlerts(),
          getLatestLaunch(),
          getUpcomingLaunches(1),
          getRockets(),
          getCrew(6),
        ])
        setApod(a)
        setNeos(n)
        setAlerts(d)
        setLaunch(l)
        setUpcoming(u)
        setRockets(r)
        setCrew(c)
      } catch (e) {
        console.error('Error loading NASA/SpaceX data:', e)
      }

      const settled = await Promise.allSettled([
        getEPICLatest(),
        getRecentSolarActivity(3),
        getISSNow(),
        getAstros(),
      ])
      const val = (i) =>
        settled[i].status === 'fulfilled' ? settled[i].value : null

      setEpic(val(0))
      setSolar(val(1))
      setIssPos(val(2))
      setAstros(val(3))
    }

    loadLaunchData()
    loadNASASpaceXData()

    const interval = setInterval(loadLaunchData, 1800000)
    return () => clearInterval(interval)
  }, [])

  const currentMission = launches.length > 0 ? launches[0] : null
  const nextLaunch = upcoming?.[0] || null
  const nextRocket = useMemo(() => {
    if (!nextLaunch || !rockets?.length) return null
    return rockets.find((r) => r.id === nextLaunch.rocket) || null
  }, [nextLaunch, rockets])

  return (
    <div className="p-4">
      {error && (
        <div className="p-4 mb-4 bg-red-900/30 border-l-4 border-red-500 text-red-200">
          <p className="font-semibold">System Alert:</p>
          <p>{error}</p>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <div className="h-[500px] border-2 border-cyan-500 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50 bg-black">
            <div className="bg-gradient-to-r from-zinc-900 to-black p-2 border-b border-cyan-600">
              <h2 className="text-lg font-semibold text-cyan-300 tracking-wider">
                GLOBAL LAUNCH SITES
              </h2>
            </div>
            <div className="h-[calc(100%-48px)]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-pulse text-cyan-400 text-xl mb-2">
                      INITIALIZING GLOBE...
                    </div>
                    <div className="text-cyan-200 text-sm">Loading launch site data</div>
                  </div>
                </div>
              ) : (
                <Globe launchSites={launchSites} />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AdminPanel launches={launches} currentMission={currentMission} />
        </div>
      </section>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
        <MissionCard
          title="Asteroid Flybys Today"
          subtitle="NEO Scout"
          content={
            neos.length ? (
              <ul className="text-xs space-y-1">
                {neos.slice(0, 5).map((o, i) => (
                  <li key={i}>
                    • {o.name} — {o.close_approach_date_full} —{' '}
                    {Number(o.miss_distance_km).toLocaleString()} km
                  </li>
                ))}
              </ul>
            ) : (
              'Loading...'
            )
          }
        />

        <MissionCard
          title="Space Weather"
          subtitle="DONKI Alerts"
          content={
            alerts.length ? (
              <ul className="text-xs space-y-1">
                {alerts.slice(0, 5).map((a, i) => (
                  <li key={i}>
                    • {a.messageType} —{' '}
                    {new Date(a.messageIssueTime).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              'Loading...'
            )
          }
        />

        <MissionCard
          title="Daily Briefing"
          subtitle="Your Orders"
          content={
            <div className="text-sm">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Identify today's APOD subject and draw it.</li>
                <li>Pick a near-Earth object and log its closest approach.</li>
                <li>Check the Solar Storm Meter.</li>
                <li>Report the next mission and its rocket.</li>
              </ol>
            </div>
          }
        />
      </section>

      <section className="border-2 border-cyan-500 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50 bg-black">
        <div className="bg-gradient-to-r from-zinc-900 to-black p-2 border-b border-cyan-600">
          <h2 className="text-lg font-semibold text-cyan-300 tracking-wider">
            UPCOMING LAUNCHES
          </h2>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {launches.length > 0 ? (
            launches.slice(0, 10).map((launch, idx) => (
              <div key={idx} className="border border-cyan-700 rounded p-4 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-cyan-300 font-semibold text-sm mb-1">
                      {launch.name || 'Unknown Mission'}
                    </h3>
                    <div className="text-xs text-cyan-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">Agency:</span>
                        <span>{launch.launch_service_provider?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">Location:</span>
                        <span>{launch.pad?.location?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">Pad:</span>
                        <span>{launch.pad?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">Rocket:</span>
                        <span>{launch.rocket?.configuration?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-cyan-400 mb-1">
                      {new Date(launch.net).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-cyan-200">
                      {new Date(launch.net).toLocaleTimeString()}
                    </div>
                    <div className={`text-xs mt-2 px-2 py-1 rounded ${
                      launch.status?.abbrev === 'Go' ? 'bg-green-900/50 text-green-300' :
                      launch.status?.abbrev === 'TBD' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-cyan-900/50 text-cyan-300'
                    }`}>
                      {launch.status?.abbrev || 'N/A'}
                    </div>
                  </div>
                </div>
                {launch.mission?.description && (
                  <p className="text-xs text-cyan-200/80 mt-2 line-clamp-2">
                    {launch.mission.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-cyan-300 py-8">
              Loading launch data...
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
