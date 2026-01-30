import React, { useEffect, useState } from 'react'
import { getAllSkyEvents, groupEventsByType } from '../lib/skyEventsDb.js'
import MissionCard from '../components/MissionCard.jsx'

export default function SkyEventsPage() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const evs = await getAllSkyEvents({ days: 60 })
        setEvents(evs)
        setError(null)
      } catch (e) {
        setError(e.message || 'Failed to load sky events')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const byType = groupEventsByType(events)

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 tracking-wider mb-2">SKY EVENTS CALENDAR</h2>
        <p className="text-sm text-cyan-200/80">Upcoming astronomical events for the next 60 days</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-pulse text-cyan-400 text-xl mb-2">SCANNING THE COSMOS...</div>
            <div className="text-cyan-200 text-sm">Loading sky event data</div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/30 border-l-4 border-red-500 text-red-200 rounded">
          <p className="font-semibold">System Alert:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <MissionCard
            title="About Sky Events"
            subtitle="Mission Briefing"
            content={
              <div className="text-xs space-y-2">
                <p>These are real astronomical events you can plan to watch!</p>
                <p className="opacity-80">
                  Found {events.length} events in the next 60 days. 
                  Check back regularly for updates.
                </p>
              </div>
            }
          />

          <MissionCard
            title="Moon Phases"
            subtitle="Lunar Calendar"
            content={renderEventsList(byType['moon-phase'], 'moon-phase')}
          />

          <MissionCard
            title="Meteor Showers"
            subtitle="Shooting Star Nights"
            content={renderEventsList(byType['meteor-shower'], 'meteor-shower')}
          />

          <MissionCard
            title="Planet Conjunctions"
            subtitle="Planets Close Together"
            content={renderEventsList(byType['conjunction'], 'conjunction')}
          />

          <MissionCard
            title="Planet Events"
            subtitle="Oppositions & Elongations"
            content={renderEventsList(byType['planet-event'], 'planet-event')}
          />

          <MissionCard
            title="Eclipses"
            subtitle="Solar & Lunar"
            content={renderEventsList(byType['eclipse'], 'eclipse')}
          />

          <MissionCard
            title="Other Events"
            subtitle="Comets, Occultations & More"
            content={renderEventsList(byType['other'], 'other')}
          />
        </div>
      )}
    </div>
  )
}

function renderEventsList(list, type) {
  if (!list || !list.length) {
    return <span className="text-xs opacity-70">No events in this window.</span>
  }

  const typeColors = {
    'moon-phase': 'text-blue-300',
    'meteor-shower': 'text-yellow-300',
    'conjunction': 'text-purple-300',
    'planet-event': 'text-orange-300',
    'eclipse': 'text-red-300',
    'other': 'text-cyan-300'
  }

  const typeIcons = {
    'moon-phase': '🌙',
    'meteor-shower': '☄️',
    'conjunction': '🪐',
    'planet-event': '🌟',
    'eclipse': '🌑',
    'other': '✨'
  }

  return (
    <ul className="text-xs space-y-3 max-h-64 overflow-auto pr-1">
      {list.map((ev, idx) => (
        <li key={idx} className="border-l-2 border-cyan-500/30 pl-2">
          <div className="flex items-start gap-2">
            <span>{typeIcons[type] || '✨'}</span>
            <div>
              <div className={`font-semibold ${typeColors[type] || 'text-cyan-300'}`}>
                {ev.title}
              </div>
              <div className="opacity-80 mt-0.5">
                {ev.start && (
                  <span className="text-cyan-400">
                    {new Date(ev.start).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
                {ev.visibility && (
                  <span className="ml-2 text-cyan-200/70">• {ev.visibility}</span>
                )}
              </div>
              {ev.description && (
                <p className="mt-1 opacity-70 text-[11px] leading-relaxed">
                  {ev.description}
                </p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
