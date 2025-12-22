import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import CommandCenterPage from './pages/CommandCenterPage.jsx'
import SkyEventsPage from './pages/SkyEventsPage.jsx'
import TonightsMissionPage from './pages/TonightsMissionPage.jsx'
import CometsPage from './pages/CometsPage.jsx'
import CometDetailPage from './pages/CometDetailPage.jsx'
import SolarMapPage from './pages/SolarMapPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-cyan-200 font-mono flex flex-col">
        {/* Global LCARS header + nav */}
        <header className="p-4 bg-gradient-to-r from-zinc-900 to-black border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
                STAR<span className="text-cyan-400">KID</span> COMMAND
              </h1>
              <p className="text-xs md:text-sm text-cyan-300 opacity-80">
                Junior Science Officer Control Network
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 text-xs md:text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                  }`
                }
              >
                Command Center
              </NavLink>
              <NavLink
                to="/sky-events"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                  }`
                }
              >
                Sky Events
              </NavLink>
              <NavLink
                to="/tonights-mission"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                  }`
                }
              >
                Tonight's Sky Mission
              </NavLink>
              <NavLink
                to="/comets"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                  }`
                }
              >
                Comets
              </NavLink>
              <NavLink
                to="/solar-map"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                  }`
                }
              >
                3D Solar Map
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Routed content */}
        <main className="flex-1 flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<CommandCenterPage />} />
            <Route path="/sky-events" element={<SkyEventsPage />} />
            <Route path="/tonights-mission" element={<TonightsMissionPage />} />
            <Route path="/comets" element={<CometsPage />} />
            <Route path="/comets/:designation" element={<CometDetailPage />} />
            <Route path="/solar-map" element={<SolarMapPage />} />
          </Routes>
        </main>

        <footer className="p-4 text-center bg-gradient-to-r from-black to-zinc-900 border-t border-cyan-800 text-xs text-cyan-300">
          <p>Built with NASA, SpaceX and astronomy APIs. For kids &amp; learning.</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}
