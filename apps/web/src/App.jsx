import React, { useEffect, useState } from 'react'
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
import LearningHubPage from './modules/learning/learningHub/LearningHubPage.jsx'
import StemActivitiesPage from './modules/learning/stem/StemActivitiesPage.jsx'
import StemActivityDetailPage from './modules/learning/stem/StemActivityDetailPage.jsx'
import StemProgressPage from './modules/learning/stem/StemProgressPage.jsx'
import CyberLabPage from './modules/learning/cyberlab/CyberLabPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AuthCallbackPage from './pages/AuthCallbackPage.jsx'
import SocialQueuePage from './pages/ops/SocialQueuePage.jsx'
import LearningPreviewPage from './pages/dev/LearningPreviewPage.jsx'
import CometWidget from './components/comet/CometWidget.jsx'
import DesktopNav from './components/nav/DesktopNav.jsx'
import MobileNav from './components/nav/MobileNav.jsx'
import { navSections } from './config/navConfig.js'
import { getCurrentActor, getSession, onAuthChange, getSupabaseClient } from '@starkid/core'
import SyncIdentityModal from './components/auth/SyncIdentityModal.jsx'

export default function App() {
  const [isGuest, setIsGuest] = useState(true)
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    let active = true
    async function loadActor() {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        const supabase = getSupabaseClient()
        if (supabase) {
          try {
            await supabase.auth.getSessionFromUrl({ storeSession: true })
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
          } catch (e) {
            // ignore
          }
        }
      }
      await getSession()
      const actor = await getCurrentActor()
      if (active) setIsGuest(actor?.mode !== 'user')
    }
    loadActor()
    const unsubscribe = onAuthChange((session) => {
      if (!active) return
      setIsGuest(!session)
    })
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

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

            {isGuest ? (
              <button
                className="ml-auto md:ml-0 px-3 py-2 rounded border border-cyan-600/60 text-cyan-200 hover:text-cyan-100 bg-black/40 text-xs"
                onClick={() => setShowSync(true)}
              >
                Sync Command Profile
              </button>
            ) : null}
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
                    <Route path="/artemis" element={<ArtemisPage />} />
                                                                          <Route path="/missions/artemis/sls" element={<SLSDetailPage />} />
                    <Route path="/missions/artemis/orion" element={<OrionDetailPage />} />
                    <Route path="/missions/briefing" element={<MissionBriefingPage />} />
                    <Route path="/missions/briefing/:missionId" element={<MissionBriefingPage />} />
                    <Route path="/learning" element={<LearningHubPage />} />
                    <Route path="/learning/stem" element={<StemActivitiesPage />} />
                    <Route path="/learning/stem/:activityId" element={<StemActivityDetailPage />} />
                    <Route path="/learning/cyberlab" element={<CyberLabPage />} />
                    <Route path="/learning/stem/progress" element={<StemProgressPage />} />
                    <Route path="/stem-activities" element={<StemActivitiesPage />} />
                    <Route path="/stem-activities/:activityId" element={<StemActivityDetailPage />} />
                    <Route path="/stem/progress" element={<StemProgressPage />} />
                                                                          <Route path="/support" element={<SupportPage />} />
                                                                          <Route path="/profile" element={<ProfilePage />} />
                                                                          <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/ops/social-queue" element={<SocialQueuePage />} />
                    {import.meta.env.DEV ? (
                      <Route path="/dev/learning-preview" element={<LearningPreviewPage />} />
                    ) : null}
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
        <SyncIdentityModal
          open={showSync}
          onClose={() => setShowSync(false)}
          onSync={() => setShowSync(false)}
        />
      </div>
    </BrowserRouter>
  )
}
