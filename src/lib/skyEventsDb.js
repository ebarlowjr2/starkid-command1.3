// src/lib/skyEventsDb.js
// Sky events data layer that fetches from database via API
// Falls back to static data if API is unavailable

import { getSkyEvents as getStaticSkyEvents } from './skyEvents.js'

const API_BASE = '/api'

/**
 * Fetch upcoming sky events from the database
 * @param {Object} options
 * @param {number} options.days - Number of days to look ahead (default: 60)
 * @param {string} options.category - Filter by category (optional)
 * @param {string} options.subtype - Filter by subtype (optional)
 * @returns {Promise<Array>}
 */
export async function getUpcomingSkyEvents({ days = 60, category = 'sky_event', subtype } = {}) {
  try {
    const params = new URLSearchParams({ type: 'upcoming', days: days.toString() })
    if (category) params.append('category', category)
    if (subtype) params.append('subtype', subtype)
    
    const response = await fetch(`${API_BASE}/sky-events?${params}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.events) {
      throw new Error('Invalid API response')
    }
    
    // Transform DB records to UI format
    return data.events.map(transformDbEventToUi)
    
  } catch (error) {
    console.warn('Failed to fetch from API, falling back to static data:', error.message)
    return getStaticSkyEvents({ days })
  }
}

/**
 * Fetch recent sky events from the database
 * @param {Object} options
 * @param {string} options.category - Filter by category (optional)
 * @param {number} options.limit - Max number of events (default: 50)
 * @returns {Promise<Array>}
 */
export async function getRecentSkyEvents({ category = 'sky_event', limit = 50 } = {}) {
  try {
    const params = new URLSearchParams({ type: 'recent', limit: limit.toString() })
    if (category) params.append('category', category)
    
    const response = await fetch(`${API_BASE}/sky-events?${params}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.events) {
      throw new Error('Invalid API response')
    }
    
    return data.events.map(transformDbEventToUi)
    
  } catch (error) {
    console.warn('Failed to fetch recent events:', error.message)
    return []
  }
}

/**
 * Transform database event record to UI format
 * @param {Object} dbEvent 
 * @returns {Object}
 */
function transformDbEventToUi(dbEvent) {
  // Map subtype to UI type
  const subtypeToType = {
    'moon_phase': 'moon-phase',
    'conjunction': 'conjunction',
    'meteor_shower': 'meteor-shower',
    'eclipse': 'eclipse',
    'planet_event': 'planet-event'
  }
  
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    type: subtypeToType[dbEvent.subtype] || dbEvent.subtype || 'other',
    start: dbEvent.event_time_utc,
    end: dbEvent.end_time_utc,
    description: dbEvent.description,
    visibility: dbEvent.visibility,
    source: dbEvent.source,
    sourceUrl: dbEvent.source_url,
    metadata: dbEvent.metadata
  }
}

/**
 * Get all sky events (combines upcoming DB events with static fallback data)
 * This provides a unified view merging USNO data with curated static events
 * @param {Object} options
 * @param {number} options.days - Number of days to look ahead
 * @returns {Promise<Array>}
 */
export async function getAllSkyEvents({ days = 60 } = {}) {
  const [dbEvents, staticEvents] = await Promise.all([
    getUpcomingSkyEvents({ days }).catch(() => []),
    getStaticSkyEvents({ days }).catch(() => [])
  ])
  
  // Create a map of DB events by date+title for deduplication
  const dbEventKeys = new Set(
    dbEvents.map(e => `${e.start?.slice(0, 10)}|${e.title?.toLowerCase()}`)
  )
  
  // Filter static events that aren't already in DB
  const uniqueStaticEvents = staticEvents.filter(e => {
    const key = `${e.start?.slice(0, 10)}|${e.title?.toLowerCase()}`
    return !dbEventKeys.has(key)
  })
  
  // Combine and sort by date
  const allEvents = [...dbEvents, ...uniqueStaticEvents]
  allEvents.sort((a, b) => new Date(a.start) - new Date(b.start))
  
  return allEvents
}

/**
 * Group events by type for display
 * @param {Array} events 
 * @returns {Object}
 */
export function groupEventsByType(events) {
  const groups = {
    'moon-phase': [],
    'meteor-shower': [],
    'conjunction': [],
    'planet-event': [],
    'eclipse': [],
    'other': []
  }
  
  events.forEach(event => {
    const type = event.type || 'other'
    if (groups[type]) {
      groups[type].push(event)
    } else {
      groups['other'].push(event)
    }
  })
  
  return groups
}
