import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
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
import OfficialUpdatesPage from './pages/updates/OfficialUpdatesPage.jsx'
import ArtemisPage from './pages/missions/ArtemisPage.jsx'
import SLSDetailPage from './pages/missions/SLSDetailPage.jsx'
import OrionDetailPage from './pages/missions/OrionDetailPage.jsx'
import MissionBriefingPage from './pages/MissionBriefingPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import SocialQueuePage from './pages/ops/SocialQueuePage.jsx'
import CometWidget from './components/comet/CometWidget.jsx'
import DesktopNav from './components/nav/DesktopNav.jsx'
import MobileNav from './components/nav/MobileNav.jsx'
import { navSections } from './config/navConfig.js'

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
            {/* Desktop Navigation */}
            <DesktopNav navSections={navSections} />
            
            {/* Mobile Navigation */}
            <MobileNav navSections={navSections} />
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
                                                                            <Route path="/updates/official" element={<OfficialUpdatesPage />} />
                                                                            <Route path="/updates/news" element={<NewsPage />} />
                                      <Route path="/updates/blog" element={<BlogListPage />} />
                                      <Route path="/updates/blog/:slug" element={<BlogDetailPage />} />
                                      <Route path="/updates/live" element={<LivePage />} />
                                      <Route path="/updates/x" element={<XPage />} />
                                      <Route path="/missions/artemis" element={<ArtemisPage />} />
                                                                          <Route path="/missions/artemis/sls" element={<SLSDetailPage />} />
                    <Route path="/missions/artemis/orion" element={<OrionDetailPage />} />
                    <Route path="/missions/briefing" element={<MissionBriefingPage />} />
                                                                                                                                                  <Route path="/support" element={<SupportPage />} />
                                                                                                                                                  <Route path="/about" element={<AboutPage />} />
                                                                                                                                                  <Route path="/ops/social-queue" element={<SocialQueuePage />} />
                                                                                                                                                </Routes>
                </main>

                <footer className="p-4 bg-gradient-to-r from-black to-zinc-900 border-t border-cyan-800 text-xs text-cyan-300">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-3">
                      <p className="font-semibold">StarKid Command — A live mission-control interface for space exploration.</p>
                      <p className="opacity-60 mt-1">No ads • No tracking • Open access</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mb-3">
                      <a href="/explore" className="hover:text-cyan-200 transition-colors">Explore</a>
                      <span className="opacity-30">|</span>
                      <a href="/support" className="hover:text-cyan-200 transition-colors">Support the Mission</a>
                      <span className="opacity-30">|</span>
                      <a href="/about" className="hover:text-cyan-200 transition-colors">About</a>
                    </div>
                    <p className="text-center opacity-50">© {new Date().getFullYear()} StarKid Command</p>
                  </div>
                </footer>
        <CometWidget />
      </div>
    </BrowserRouter>
  )
}
