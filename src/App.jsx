import React, { useEffect, useState } from 'react'
import Globe from './components/Globe.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import { getUpcomingLaunchesFromLibrary } from './lib/launchLibrary.js'

export default function App() {
  const [launches, setLaunches] = useState([])
  const [launchSites, setLaunchSites] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

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

    loadLaunchData()

    const interval = setInterval(loadLaunchData, 300000)
    return () => clearInterval(interval)
  }, [])

  const currentMission = launches.length > 0 ? launches[0] : null

  return (
    <div className="min-h-screen bg-black text-cyan-200 font-mono overflow-hidden">
      <header className="p-4 bg-gradient-to-r from-zinc-900 to-black border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
        <h1 className="text-3xl font-bold tracking-wider">
          STAR<span className="text-cyan-400">KID</span> COMMAND
        </h1>
        <p className="text-sm text-cyan-300">Mission Control Center - Real-Time Launch Tracking</p>
      </header>

      {error && (
        <div className="p-4 bg-red-900/30 border-l-4 border-red-500 text-red-200">
          <p className="font-semibold">System Alert:</p>
          <p>{error}</p>
        </div>
      )}

      <main className="h-[calc(100vh-120px)] p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-full">
          <div className="h-full border-2 border-cyan-500 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50 bg-black">
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

        <div className="lg:col-span-1 h-full">
          <AdminPanel launches={launches} currentMission={currentMission} />
        </div>
      </main>

      <footer className="p-3 text-center bg-gradient-to-r from-black to-zinc-900 border-t border-cyan-800 text-xs text-cyan-300">
        <p>Powered by Launch Library 2 API & NASA Web WorldWind | Real-Time Space Mission Tracking</p>
      </footer>
    </div>
  )
}
