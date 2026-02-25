import React, { useEffect, useState } from 'react'
import MissionCard from '../components/MissionCard.jsx'
import { getMoonSummary, getMoonDescription } from '@starkid/core'
import { getSkyEvents } from '@starkid/core'
import { getTonightsMissions, calculateTotalPoints, getBadgeForPoints } from '@starkid/core'

const STORAGE_KEY = 'starkid_tonights_mission_completed'
const POINTS_KEY = 'starkid_total_points'

export default function TonightsMissionPage() {
  const [moon, setMoon] = useState(null)
  const [events, setEvents] = useState([])
  const [missions, setMissions] = useState([])
  const [completed, setCompleted] = useState({})
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load completed missions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const storedPoints = localStorage.getItem(POINTS_KEY)
    if (stored) {
      try {
        setCompleted(JSON.parse(stored))
      } catch {
        setCompleted({})
      }
    }
    if (storedPoints) {
      try {
        setTotalPoints(parseInt(storedPoints, 10) || 0)
      } catch {
        setTotalPoints(0)
      }
    }
  }, [])

  // Load sky data and missions
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [m, evs, ms] = await Promise.all([
          getMoonSummary(),
          getSkyEvents({ days: 1 }),
          getTonightsMissions(),
        ])
        setMoon(m)
        setEvents(evs)
        setMissions(ms)
      } catch (error) {
        console.error('Error loading mission data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Save completed missions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
  }, [completed])

  // Save total points to localStorage
  useEffect(() => {
    localStorage.setItem(POINTS_KEY, totalPoints.toString())
  }, [totalPoints])

  const toggleMission = (mission) => {
    setCompleted((prev) => {
      const wasCompleted = prev[mission.id]
      const next = { ...prev, [mission.id]: !wasCompleted }
      
      // Update total points
      if (!wasCompleted) {
        setTotalPoints(p => p + (mission.points || 0))
      } else {
        setTotalPoints(p => Math.max(0, p - (mission.points || 0)))
      }
      
      return next
    })
  }

  const completedCount = Object.values(completed).filter(Boolean).length
  const badge = getBadgeForPoints(totalPoints)

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wider mb-2">TONIGHT&apos;S SKY MISSION</h2>
        <p className="text-sm text-cyan-200/80">Your personalized stargazing missions for tonight</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Briefing card */}
        <MissionCard
          title="Tonight's Sky Briefing"
          subtitle="Read Before Launch"
          content={
            loading ? (
              <div className="text-sm animate-pulse">Scanning the sky...</div>
            ) : (
              <div className="text-xs space-y-3">
                {moon && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moon.emoji}</span>
                      <div>
                        <div className="font-semibold text-cyan-300">{moon.phaseName}</div>
                        <div className="opacity-80">{Math.round((moon.illumination || 0) * 100)}% illuminated</div>
                      </div>
                    </div>
                    <p className="text-[11px] opacity-70 mt-2">
                      {getMoonDescription(moon.phaseName)}
                    </p>
                    {moon.nextFullMoon && (
                      <div className="text-[11px] opacity-60">
                        Next full moon: {new Date(moon.nextFullMoon).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
                {events && events.length > 0 && (
                  <div className="border-t border-cyan-500/20 pt-2">
                    <div className="font-semibold text-yellow-300">Special Event Tonight!</div>
                    <div className="opacity-80 mt-1">
                      {events[0].title}
                    </div>
                    <div className="text-[11px] opacity-60">
                      {events[0].type}
                    </div>
                  </div>
                )}
                {!moon && events.length === 0 && (
                  <div>No special briefings today. You are free to explore!</div>
                )}
              </div>
            )
          }
        />

        {/* Badge & Progress card */}
        <MissionCard
          title="Your Progress"
          subtitle="Space Explorer Status"
          content={
            <div className="text-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{badge.emoji}</div>
                <div>
                  <div className="font-semibold text-cyan-300 text-sm">{badge.name}</div>
                  <div className="opacity-80">Level {badge.level}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Points</span>
                  <span className="text-cyan-400 font-semibold">{totalPoints}</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 border border-cyan-500/30">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalPoints % 50) * 2)}%` }}
                  />
                </div>
                <div className="text-[10px] opacity-60 text-right">
                  {50 - (totalPoints % 50)} points to next level
                </div>
              </div>
              <div className="border-t border-cyan-500/20 pt-2">
                <div className="text-[11px] opacity-70">
                  Complete missions to earn points and unlock new badges!
                </div>
              </div>
            </div>
          }
        />

        {/* Quick Stats card */}
        <MissionCard
          title="Mission Stats"
          subtitle="Tonight's Progress"
          content={
            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span>Missions Available</span>
                <span className="text-cyan-400 font-semibold">{missions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Completed Tonight</span>
                <span className="text-green-400 font-semibold">{completedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Points Possible</span>
                <span className="text-yellow-400 font-semibold">
                  {missions.reduce((sum, m) => sum + (m.points || 0), 0)}
                </span>
              </div>
              {completedCount === missions.length && missions.length > 0 && (
                <div className="mt-3 p-2 bg-green-900/30 border border-green-500/30 rounded text-center">
                  <span className="text-green-300">All missions complete! Great job, Space Explorer!</span>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Missions list */}
      <div className="mt-6">
        <div className="border-2 border-cyan-500 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/50 bg-black">
          <div className="bg-gradient-to-r from-zinc-900 to-black p-3 border-b border-cyan-600 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cyan-300 tracking-wider">
              ACTIVE MISSIONS
            </h3>
            <span className="text-cyan-400 text-sm">
              {completedCount} / {missions.length} Complete
            </span>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-cyan-400 text-lg mb-2">PREPARING MISSIONS...</div>
                <div className="text-cyan-200 text-sm">Analyzing tonight&apos;s sky conditions</div>
              </div>
            ) : missions.length === 0 ? (
              <div className="text-center py-8 text-cyan-300">
                No missions available. Try again in a few minutes.
              </div>
            ) : (
              <div className="space-y-4">
                {missions.map((m) => (
                  <div
                    key={m.id}
                    className={`border rounded-lg p-4 transition-all duration-300 ${
                      completed[m.id] 
                        ? 'border-green-500/50 bg-green-900/20' 
                        : 'border-cyan-500/30 bg-black/40 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleMission(m)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                          completed[m.id] 
                            ? 'bg-green-500 border-green-400 text-black' 
                            : 'border-cyan-400 hover:bg-cyan-500/20'
                        }`}
                        aria-label="Toggle mission complete"
                      >
                        {completed[m.id] ? '✓' : ''}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className={`font-semibold ${completed[m.id] ? 'text-green-300' : 'text-cyan-300'}`}>
                            {m.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase ${
                            m.difficulty === 'medium' 
                              ? 'border-yellow-500/50 text-yellow-300' 
                              : 'border-cyan-500/50 text-cyan-300'
                          }`}>
                            {m.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-900/30 text-cyan-400 text-[10px]">
                            +{m.points} pts
                          </span>
                        </div>
                        
                        {m.recommendedTime && (
                          <div className="text-xs text-cyan-400/80 mt-1">
                            Best time: {m.recommendedTime}
                          </div>
                        )}
                        
                        <p className={`mt-2 text-sm leading-relaxed ${
                          completed[m.id] ? 'text-green-200/70' : 'text-cyan-200/80'
                        }`}>
                          {m.description}
                        </p>
                        
                        {m.tags && m.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {m.tags.map((tag, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 rounded bg-zinc-800 text-cyan-300/60 text-[10px]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="mt-6">
        <MissionCard
          title="Stargazing Tips"
          subtitle="For Best Results"
          content={
            <div className="text-xs space-y-2">
              <p>• Find a dark spot away from street lights</p>
              <p>• Let your eyes adjust for 15-20 minutes</p>
              <p>• Bring a red flashlight (it won&apos;t ruin your night vision)</p>
              <p>• Check the weather - clear skies are best!</p>
              <p>• Always go outside with an adult</p>
            </div>
          }
        />
      </div>
    </div>
  )
}
