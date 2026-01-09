import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import ExploreHubPage from './pages/ExploreHubPage.jsx'
import CommandCenterPage from './pages/CommandCenterPage.jsx'
import SkyEventsPage from './pages/SkyEventsPage.jsx'
import TonightsMissionPage from './pages/TonightsMissionPage.jsx'
import CometsPage from './pages/CometsPage.jsx'
import CometDetailPage from './pages/CometDetailPage.jsx'
import SolarMapPage from './pages/SolarMapPage.jsx'
import PlanetsHubPage from './pages/planets/PlanetsHubPage.jsx'
import MarsCommandCenterPage from './pages/planets/MarsCommandCenterPage.jsx'
import BeyondSolarSystemPage from './pages/beyond/BeyondSolarSystemPage.jsx'
import RocketsSectionPage from './pages/rockets/RocketsSectionPage.jsx'
import RocketsHubPage from './pages/rockets/RocketsHubPage.jsx'
import RocketDetailPage from './pages/rockets/RocketDetailPage.jsx'
import SpacecraftHubPage from './pages/rockets/SpacecraftHubPage.jsx'
import SpacecraftDetailPage from './pages/rockets/SpacecraftDetailPage.jsx'
import UpdatesHubPage from './pages/updates/UpdatesHubPage.jsx'
import NewsPage from './pages/updates/NewsPage.jsx'
import BlogListPage from './pages/updates/BlogListPage.jsx'
import BlogDetailPage from './pages/updates/BlogDetailPage.jsx'
import LivePage from './pages/updates/LivePage.jsx'
import XPage from './pages/updates/XPage.jsx'
import ArtemisPage from './pages/missions/ArtemisPage.jsx'
import SLSDetailPage from './pages/missions/SLSDetailPage.jsx'
import OrionDetailPage from './pages/missions/OrionDetailPage.jsx'

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
                              to="/command"
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
              <NavLink
                to="/planets"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                      : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                  }`
                }
              >
                Visit Another Planet
              </NavLink>
              <NavLink
                to="/beyond"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded border transition-all ${
                    isActive 
                      ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-md shadow-purple-500/30' 
                      : 'bg-black/40 border-purple-500/40 text-purple-300 hover:bg-purple-500/10'
                  }`
                }
              >
                Beyond Our Solar System
              </NavLink>
                          <NavLink
                            to="/rockets"
                            className={({ isActive }) =>
                              `px-3 py-1.5 rounded border transition-all ${
                                isActive 
                                  ? 'bg-orange-500/30 border-orange-400 text-orange-200 shadow-md shadow-orange-500/30' 
                                  : 'bg-black/40 border-orange-500/40 text-orange-300 hover:bg-orange-500/10'
                              }`
                            }
                          >
                            Rocket Science
                          </NavLink>
                          <NavLink
                            to="/updates"
                            className={({ isActive }) =>
                              `px-3 py-1.5 rounded border transition-all ${
                                isActive 
                                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30' 
                                  : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10'
                              }`
                            }
                          >
                            Updates
                          </NavLink>
                        </nav>
          </div>
        </header>

        {/* Routed content */}
                <main className="flex-1 flex flex-col min-h-0">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/explore" element={<ExploreHubPage />} />
                    <Route path="/command" element={<CommandCenterPage />} />
                    <Route path="/sky-events" element={<SkyEventsPage />} />
                    <Route path="/tonights-mission" element={<TonightsMissionPage />} />
                    <Route path="/comets" element={<CometsPage />} />
                    <Route path="/comets/:designation" element={<CometDetailPage />} />
                    <Route path="/solar-map" element={<SolarMapPage />} />
                    <Route path="/planets" element={<PlanetsHubPage />} />
                    <Route path="/planets/mars" element={<MarsCommandCenterPage />} />
                    <Route path="/beyond" element={<BeyondSolarSystemPage />} />
                    <Route path="/rockets" element={<RocketsSectionPage />} />
                    <Route path="/rockets/launch-vehicles" element={<RocketsHubPage />} />
                    <Route path="/rockets/launch-vehicles/:rocketId" element={<RocketDetailPage />} />
                                      <Route path="/rockets/spacecraft" element={<SpacecraftHubPage />} />
                                      <Route path="/rockets/spacecraft/:spacecraftId" element={<SpacecraftDetailPage />} />
                                      <Route path="/updates" element={<UpdatesHubPage />} />
                                      <Route path="/updates/news" element={<NewsPage />} />
                                      <Route path="/updates/blog" element={<BlogListPage />} />
                                      <Route path="/updates/blog/:slug" element={<BlogDetailPage />} />
                                      <Route path="/updates/live" element={<LivePage />} />
                                      <Route path="/updates/x" element={<XPage />} />
                                      <Route path="/missions/artemis" element={<ArtemisPage />} />
                                      <Route path="/missions/artemis/sls" element={<SLSDetailPage />} />
                                      <Route path="/missions/artemis/orion" element={<OrionDetailPage />} />
                                    </Routes>
                </main>

        <footer className="p-4 text-center bg-gradient-to-r from-black to-zinc-900 border-t border-cyan-800 text-xs text-cyan-300">
          <p>Built with NASA, SpaceX and astronomy APIs. For kids &amp; learning.</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}
