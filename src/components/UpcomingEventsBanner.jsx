// src/components/UpcomingEventsBanner.jsx
// Banner component showing urgent sky events in the next 30 days

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUrgentSkyEvents } from '../lib/skyEventsDb.js'

const typeIcons = {
  'eclipse': '🌑',
  'meteor-shower': '☄️',
  'moon-phase': '🌙',
  'conjunction': '🪐',
  'planet-event': '🌟',
  'other': '✨'
}

const typeColors = {
  'eclipse': { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#fca5a5' },
  'meteor-shower': { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#fde047' },
  'moon-phase': { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#93c5fd' },
  'conjunction': { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#c4b5fd' },
  'planet-event': { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#fdba74' },
  'other': { bg: 'rgba(34, 211, 238, 0.15)', border: 'rgba(34, 211, 238, 0.4)', text: '#67e8f9' }
}

function formatEventDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'TODAY'
  if (diffDays === 1) return 'TOMORROW'
  if (diffDays <= 7) return `IN ${diffDays} DAYS`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getEventLabel(event) {
  const title = event.title || ''
  
  if (event.type === 'eclipse') {
    if (title.toLowerCase().includes('solar')) return 'SOLAR ECLIPSE'
    if (title.toLowerCase().includes('lunar')) return 'LUNAR ECLIPSE'
    return 'ECLIPSE'
  }
  if (event.type === 'meteor-shower') return 'METEOR SHOWER'
  if (event.type === 'moon-phase') {
    if (title.toLowerCase().includes('full')) return 'FULL MOON'
    if (title.toLowerCase().includes('new')) return 'NEW MOON'
    return 'MOON PHASE'
  }
  return 'SKY EVENT'
}

export default function UpcomingEventsBanner() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const urgentEvents = await getUrgentSkyEvents()
        setEvents(urgentEvents)
      } catch (e) {
        console.warn('Failed to load urgent events:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || events.length === 0) {
    return null
  }

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(239, 68, 68, 0.1) 100%)',
        border: '1px solid rgba(34, 211, 238, 0.3)',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            background: 'rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            animation: 'pulse 2s infinite',
          }}
        >
          UPCOMING
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          SKY EVENTS IN THE NEXT 30 DAYS
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {events.map((event, idx) => {
          const colors = typeColors[event.type] || typeColors.other
          const icon = typeIcons[event.type] || typeIcons.other
          
          return (
            <div
              key={idx}
              onClick={() => nav('/sky-events')}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1 1 auto',
                minWidth: 180,
                maxWidth: 280,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: colors.text,
                      letterSpacing: '0.03em',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {getEventLabel(event)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: 2,
                    }}
                  >
                    {formatEventDate(event.start)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
