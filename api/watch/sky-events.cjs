// api/watch/sky-events.js
// Serverless function to fetch USNO moon phases and ingest into mission_events table
// Scheduled via Vercel cron (every 6 hours)

const crypto = require('crypto')
const { getSupabase, isSupabaseConfigured } = require('../_lib/supabase.cjs')

// USNO API base URL
const USNO_API_BASE = 'https://aa.usno.navy.mil/api'

// High-signal moon phases that should trigger social drafts
const HIGH_SIGNAL_PHASES = ['Full Moon', 'New Moon']

/**
 * Generate a stable hash for deduplication
 * @param {string} category 
 * @param {string} subtype 
 * @param {string} title 
 * @param {string} eventTimeUtc 
 * @returns {string}
 */
function generateEventHash(category, subtype, title, eventTimeUtc) {
  const data = `${category}${subtype}${title}${eventTimeUtc}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Convert USNO date/time to ISO UTC string
 * USNO returns time in UT (Universal Time)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {string} ISO 8601 UTC timestamp
 */
function usnoToIsoUtc(date, time) {
  // USNO returns UT which is essentially UTC
  return `${date}T${time}:00Z`
}

/**
 * Fetch moon phases from USNO for a given year
 * @param {number} year 
 * @returns {Promise<Array>}
 */
async function fetchUsnoMoonPhases(year) {
  const url = `${USNO_API_BASE}/moon/phases/year?year=${year}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`USNO API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.phasedata || !Array.isArray(data.phasedata)) {
      console.warn(`No phase data returned for year ${year}`)
      return []
    }
    
    return data.phasedata.map(phase => ({
      phase: phase.phase,
      date: phase.date,
      time: phase.time,
      year: data.year
    }))
  } catch (error) {
    console.error(`Error fetching USNO data for year ${year}:`, error)
    return []
  }
}

/**
 * Convert USNO moon phase to mission_events record
 * @param {Object} phaseData 
 * @returns {Object}
 */
function convertToMissionEvent(phaseData) {
  const eventTimeUtc = usnoToIsoUtc(phaseData.date, phaseData.time)
  const title = `MOON PHASE — ${phaseData.phase.toUpperCase()}`
  const category = 'sky_event'
  const subtype = 'moon_phase'
  
  const isHighSignal = HIGH_SIGNAL_PHASES.includes(phaseData.phase)
  
  return {
    title,
    event_hash: generateEventHash(category, subtype, title, eventTimeUtc),
    category,
    subtype,
    event_time_utc: eventTimeUtc,
    description: getMoonPhaseDescription(phaseData.phase),
    visibility: getMoonPhaseVisibility(phaseData.phase),
    source: 'USNO Astronomical Applications',
    source_url: `${USNO_API_BASE}/moon/phases/year?year=${phaseData.year}`,
    metadata: {
      phase_name: phaseData.phase,
      usno_date: phaseData.date,
      usno_time: phaseData.time
    },
    social_draft_eligible: isHighSignal,
    social_draft_created: false
  }
}

/**
 * Get description for moon phase
 * @param {string} phase 
 * @returns {string}
 */
function getMoonPhaseDescription(phase) {
  const descriptions = {
    'New Moon': 'The Moon is between Earth and the Sun, with its illuminated side facing away from us. Best time for stargazing!',
    'First Quarter': 'Half of the Moon\'s visible surface is illuminated. The Moon rises around noon and sets around midnight.',
    'Full Moon': 'The entire face of the Moon is illuminated by the Sun. A great night for moonlit activities!',
    'Last Quarter': 'Half of the Moon\'s visible surface is illuminated. The Moon rises around midnight and sets around noon.'
  }
  return descriptions[phase] || `The Moon is in its ${phase} phase.`
}

/**
 * Get visibility info for moon phase
 * @param {string} phase 
 * @returns {string}
 */
function getMoonPhaseVisibility(phase) {
  const visibility = {
    'New Moon': 'Not visible (best for deep sky observation)',
    'First Quarter': 'Visible afternoon through midnight',
    'Full Moon': 'Visible all night',
    'Last Quarter': 'Visible midnight through morning'
  }
  return visibility[phase] || 'Check local conditions'
}

/**
 * Create social draft for high-signal sky events
 * @param {Object} supabase 
 * @param {Object} event 
 * @returns {Promise<void>}
 */
async function createSocialDraft(supabase, event) {
  const phaseName = event.metadata?.phase_name || 'Moon Phase'
  const eventDate = new Date(event.event_time_utc)
  const dateStr = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
  
  let body = ''
  let hashtags = ['#MoonPhase', '#Astronomy', '#SkyEvents', '#StarKid']
  
  if (phaseName === 'Full Moon') {
    body = `Full Moon Alert! On ${dateStr}, look up to see the Moon at its brightest. Perfect night for moongazing with the family!`
    hashtags.push('#FullMoon')
  } else if (phaseName === 'New Moon') {
    body = `New Moon on ${dateStr}! With the Moon hidden, it's the perfect time for stargazing. Can you spot the Milky Way?`
    hashtags.push('#NewMoon', '#Stargazing')
  }
  
  const draft = {
    event_id: event.id,
    title: event.title,
    body,
    hashtags,
    platform: 'all',
    status: 'DRAFT',
    reminder_type: 'event_day',
    metadata: {
      auto_generated: true,
      event_category: event.category,
      event_subtype: event.subtype
    }
  }
  
  const { error } = await supabase
    .from('social_posts')
    .insert(draft)
  
  if (error) {
    console.error('Error creating social draft:', error)
  } else {
    // Mark event as having draft created
    await supabase
      .from('mission_events')
      .update({ social_draft_created: true })
      .eq('id', event.id)
  }
}

/**
 * Main handler for the sky-events watch endpoint
 */
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Check Supabase configuration
  if (!isSupabaseConfigured()) {
    return res.status(500).json({
      error: 'Supabase not configured',
      message: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
    })
  }
  
  const supabase = getSupabase()
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1
  
  const results = {
    fetched: 0,
    inserted: 0,
    duplicates: 0,
    errors: [],
    socialDraftsCreated: 0
  }
  
  try {
    // Fetch moon phases for current and next year
    const [currentYearPhases, nextYearPhases] = await Promise.all([
      fetchUsnoMoonPhases(currentYear),
      fetchUsnoMoonPhases(nextYear)
    ])
    
    const allPhases = [...currentYearPhases, ...nextYearPhases]
    results.fetched = allPhases.length
    
    // Process each phase
    for (const phase of allPhases) {
      const eventRecord = convertToMissionEvent(phase)
      
      // Try to insert (will fail on duplicate hash due to unique constraint)
      const { data, error } = await supabase
        .from('mission_events')
        .upsert(eventRecord, { 
          onConflict: 'event_hash',
          ignoreDuplicates: true 
        })
        .select()
      
      if (error) {
        if (error.code === '23505') {
          // Duplicate - this is expected
          results.duplicates++
        } else {
          results.errors.push({
            phase: phase.phase,
            date: phase.date,
            error: error.message
          })
        }
      } else if (data && data.length > 0) {
        results.inserted++
        
        // Create social draft for high-signal events
        const insertedEvent = data[0]
        if (insertedEvent.social_draft_eligible && !insertedEvent.social_draft_created) {
          await createSocialDraft(supabase, insertedEvent)
          results.socialDraftsCreated++
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Sky events sync completed`,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Sky events sync error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      results
    })
  }
}
