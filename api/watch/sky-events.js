// api/watch/sky-events.js
// Serverless function to fetch USNO moon phases and eclipses into mission_events table
// Scheduled via Vercel cron (daily)
// Supports ?type=moon (default), ?type=eclipses, or ?type=all

import crypto from 'crypto'
import { getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

const USNO_API_BASE = 'https://aa.usno.navy.mil/api'

const HIGH_SIGNAL_PHASES = ['Full Moon', 'New Moon']

// Lunar eclipse data (USNO doesn't have a lunar eclipse API, so we use curated data)
const LUNAR_ECLIPSES = [
  { date: '2026-03-03', type: 'total', peak_time: '11:34', visibility: 'Americas, Europe, Africa, western Asia', duration_totality: '58 min', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2026-08-28', type: 'partial', peak_time: '04:14', visibility: 'Americas, Europe, Africa, Asia, Australia', magnitude: 0.93, nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2027-02-20', type: 'penumbral', peak_time: '23:13', visibility: 'Americas, Europe, Africa, Asia', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2027-07-18', type: 'penumbral', peak_time: '16:03', visibility: 'Asia, Australia, Pacific, Americas', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2027-08-17', type: 'penumbral', peak_time: '07:14', visibility: 'Pacific, Americas, Europe, Africa', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2028-01-12', type: 'partial', peak_time: '04:14', visibility: 'Americas, Europe, Africa', magnitude: 0.07, nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2028-07-06', type: 'partial', peak_time: '18:20', visibility: 'Australia, Asia, Antarctica', magnitude: 0.39, nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2028-12-31', type: 'total', peak_time: '16:52', visibility: 'Europe, Africa, Asia, Australia', duration_totality: '71 min', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2029-06-26', type: 'total', peak_time: '03:22', visibility: 'Americas, Europe, Africa, Middle East', duration_totality: '102 min', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
  { date: '2029-12-20', type: 'total', peak_time: '22:42', visibility: 'Americas, Europe, Africa, Asia', duration_totality: '54 min', nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/' },
]

function generateEventHash(category, subtype, title, eventTimeUtc) {
  const data = `${category}${subtype}${title}${eventTimeUtc}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

function usnoToIsoUtc(year, month, day, time) {
  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${monthStr}-${dayStr}T${time}:00Z`
}

// ============ MOON PHASES ============

async function fetchUsnoMoonPhases(year) {
  const url = `${USNO_API_BASE}/moon/phases/year?year=${year}`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`USNO API error: ${response.status}`)
    const data = await response.json()
    if (!data.phasedata || !Array.isArray(data.phasedata)) return []
    return data.phasedata.map(phase => ({ phase: phase.phase, year: phase.year, month: phase.month, day: phase.day, time: phase.time }))
  } catch (error) {
    console.error(`Error fetching USNO moon phases for year ${year}:`, error)
    return []
  }
}

function convertMoonPhaseToEvent(phaseData) {
  const eventTimeUtc = usnoToIsoUtc(phaseData.year, phaseData.month, phaseData.day, phaseData.time)
  const title = `MOON PHASE — ${phaseData.phase.toUpperCase()}`
  const category = 'sky_event'
  const subtype = 'moon_phase'
  const isHighSignal = HIGH_SIGNAL_PHASES.includes(phaseData.phase)
  
  const descriptions = {
    'New Moon': 'The Moon is between Earth and the Sun, with its illuminated side facing away from us. Best time for stargazing!',
    'First Quarter': 'Half of the Moon\'s visible surface is illuminated. The Moon rises around noon and sets around midnight.',
    'Full Moon': 'The entire face of the Moon is illuminated by the Sun. A great night for moonlit activities!',
    'Last Quarter': 'Half of the Moon\'s visible surface is illuminated. The Moon rises around midnight and sets around noon.'
  }
  const visibility = {
    'New Moon': 'Not visible (best for deep sky observation)',
    'First Quarter': 'Visible afternoon through midnight',
    'Full Moon': 'Visible all night',
    'Last Quarter': 'Visible midnight through morning'
  }
  
  return {
    title,
    event_hash: generateEventHash(category, subtype, title, eventTimeUtc),
    category,
    subtype,
    event_time_utc: eventTimeUtc,
    description: descriptions[phaseData.phase] || `The Moon is in its ${phaseData.phase} phase.`,
    visibility: visibility[phaseData.phase] || 'Check local conditions',
    source: 'USNO Astronomical Applications',
    source_url: `${USNO_API_BASE}/moon/phases/year?year=${phaseData.year}`,
    metadata: { phase_name: phaseData.phase, usno_year: phaseData.year, usno_month: phaseData.month, usno_day: phaseData.day, usno_time: phaseData.time },
    social_draft_eligible: isHighSignal,
    social_draft_created: false
  }
}

// ============ ECLIPSES ============

async function fetchUsnoSolarEclipses(year) {
  const url = `${USNO_API_BASE}/eclipses/solar/year?year=${year}`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`USNO API error: ${response.status}`)
    const data = await response.json()
    if (!data.eclipses_in_year || !Array.isArray(data.eclipses_in_year)) return []
    return data.eclipses_in_year.map(eclipse => {
      const lower = eclipse.event.toLowerCase()
      let eclipseType = 'unknown'
      if (lower.includes('total')) eclipseType = 'total'
      else if (lower.includes('annular')) eclipseType = 'annular'
      else if (lower.includes('partial')) eclipseType = 'partial'
      else if (lower.includes('hybrid')) eclipseType = 'hybrid'
      return { year: eclipse.year, month: eclipse.month, day: eclipse.day, type: 'solar', subtype: eclipseType, event_name: eclipse.event }
    })
  } catch (error) {
    console.error(`Error fetching USNO solar eclipses for year ${year}:`, error)
    return []
  }
}

function convertSolarEclipseToEvent(eclipse) {
  const dateStr = `${eclipse.year}-${String(eclipse.month).padStart(2, '0')}-${String(eclipse.day).padStart(2, '0')}`
  const eventTimeUtc = `${dateStr}T12:00:00Z`
  const title = `SOLAR ECLIPSE — ${eclipse.subtype.toUpperCase()}`
  const category = 'sky_event'
  const subtype = 'eclipse'
  
  const typeDescriptions = {
    total: 'The Moon completely covers the Sun, revealing the corona. One of nature\'s most spectacular events!',
    annular: 'The Moon covers the Sun\'s center, leaving a bright ring (annulus) visible. Also called a "ring of fire" eclipse.',
    partial: 'The Moon partially covers the Sun. Use proper solar viewing glasses to observe safely.',
    hybrid: 'A rare eclipse that appears annular in some locations and total in others.',
  }
  
  return {
    title,
    event_hash: generateEventHash(category, subtype, title, eventTimeUtc),
    category,
    subtype,
    event_time_utc: eventTimeUtc,
    description: typeDescriptions[eclipse.subtype] || 'A solar eclipse occurs when the Moon passes between Earth and the Sun.',
    visibility: 'Check NASA or timeanddate.com for visibility in your location',
    source: 'USNO Astronomical Applications',
    source_url: `${USNO_API_BASE}/eclipses/solar/year?year=${eclipse.year}`,
    metadata: {
      eclipse_type: 'solar',
      eclipse_subtype: eclipse.subtype,
      event_name: eclipse.event_name,
      linkouts: { nasa: 'https://science.nasa.gov/eclipses/future-eclipses/', usno: 'https://aa.usno.navy.mil/data/SolarEclipses', timeanddate: `https://www.timeanddate.com/eclipse/solar/${dateStr}` }
    },
    social_draft_eligible: eclipse.subtype === 'total' || eclipse.subtype === 'annular',
    social_draft_created: false
  }
}

function convertLunarEclipseToEvent(eclipse) {
  const eventTimeUtc = `${eclipse.date}T${eclipse.peak_time}:00Z`
  const title = `LUNAR ECLIPSE — ${eclipse.type.toUpperCase()}`
  const category = 'sky_event'
  const subtype = 'eclipse'
  
  const typeDescriptions = {
    total: `A total lunar eclipse! The Moon turns a deep red color as it passes through Earth's shadow. ${eclipse.duration_totality ? `Totality lasts ${eclipse.duration_totality}.` : ''}`,
    partial: `A partial lunar eclipse where ${eclipse.magnitude ? `${Math.round(eclipse.magnitude * 100)}%` : 'part'} of the Moon enters Earth's shadow.`,
    penumbral: 'A subtle penumbral eclipse where the Moon passes through Earth\'s outer shadow. Look for slight dimming on one side.',
  }
  
  return {
    title,
    event_hash: generateEventHash(category, subtype, title, eventTimeUtc),
    category,
    subtype,
    event_time_utc: eventTimeUtc,
    description: typeDescriptions[eclipse.type] || 'A lunar eclipse occurs when Earth passes between the Sun and Moon.',
    visibility: eclipse.visibility,
    source: 'NASA Eclipse Web Site',
    source_url: eclipse.nasa_url,
    metadata: {
      eclipse_type: 'lunar',
      eclipse_subtype: eclipse.type,
      peak_time: eclipse.peak_time,
      duration_totality: eclipse.duration_totality,
      magnitude: eclipse.magnitude,
      linkouts: { nasa: eclipse.nasa_url, timeanddate: `https://www.timeanddate.com/eclipse/lunar/${eclipse.date}` }
    },
    social_draft_eligible: eclipse.type === 'total',
    social_draft_created: false
  }
}

// ============ SOCIAL DRAFTS ============

async function createMoonPhaseDraft(supabase, event) {
  const phaseName = event.metadata?.phase_name || 'Moon Phase'
  const eventDate = new Date(event.event_time_utc)
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  
  let body = ''
  let hashtags = ['#MoonPhase', '#Astronomy', '#SkyEvents', '#StarKid']
  
  if (phaseName === 'Full Moon') {
    body = `Full Moon Alert! On ${dateStr}, look up to see the Moon at its brightest. Perfect night for moongazing with the family!`
    hashtags.push('#FullMoon')
  } else if (phaseName === 'New Moon') {
    body = `New Moon on ${dateStr}! With the Moon hidden, it's the perfect time for stargazing. Can you spot the Milky Way?`
    hashtags.push('#NewMoon', '#Stargazing')
  }
  
  if (!body) return false
  
  const draft = { event_id: event.id, title: event.title, body, hashtags, platform: 'all', status: 'DRAFT', reminder_type: 'event_day', metadata: { auto_generated: true, event_category: event.category, event_subtype: event.subtype } }
  const { error } = await supabase.from('social_posts').insert(draft)
  if (error) { console.error('Error creating moon phase draft:', error); return false }
  await supabase.from('mission_events').update({ social_draft_created: true }).eq('id', event.id)
  return true
}

async function createEclipseDraft(supabase, event) {
  const eclipseType = event.metadata?.eclipse_type || 'eclipse'
  const eclipseSubtype = event.metadata?.eclipse_subtype || ''
  const eventDate = new Date(event.event_time_utc)
  const dateStr = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  
  let body = ''
  let hashtags = ['#Eclipse', '#Astronomy', '#SkyEvents', '#StarKid']
  
  if (eclipseType === 'solar') {
    if (eclipseSubtype === 'total') {
      body = `Total Solar Eclipse Alert! On ${dateStr}, the Moon will completely cover the Sun. If you're in the path of totality, this is a must-see event! Remember: NEVER look at the Sun without proper eclipse glasses.`
      hashtags.push('#SolarEclipse', '#TotalEclipse')
    } else if (eclipseSubtype === 'annular') {
      body = `Ring of Fire Eclipse on ${dateStr}! An annular solar eclipse will create a stunning ring of light around the Moon. Use certified eclipse glasses to view safely!`
      hashtags.push('#SolarEclipse', '#RingOfFire')
    }
  } else if (eclipseType === 'lunar' && eclipseSubtype === 'total') {
    body = `Blood Moon Alert! On ${dateStr}, watch the Moon turn deep red during a total lunar eclipse. No special equipment needed - just find a clear view of the sky!`
    hashtags.push('#LunarEclipse', '#BloodMoon')
  }
  
  if (!body) return false
  
  const draft = { event_id: event.id, title: event.title, body, hashtags, platform: 'all', status: 'DRAFT', reminder_type: 'event_day', metadata: { auto_generated: true, event_category: event.category, event_subtype: event.subtype, eclipse_type: eclipseType, eclipse_subtype: eclipseSubtype } }
  const { error } = await supabase.from('social_posts').insert(draft)
  if (error) { console.error('Error creating eclipse draft:', error); return false }
  await supabase.from('mission_events').update({ social_draft_created: true }).eq('id', event.id)
  return true
}

// ============ SYNC FUNCTIONS ============

async function syncMoonPhases(supabase) {
  const currentYear = new Date().getFullYear()
  const results = { fetched: 0, inserted: 0, duplicates: 0, errors: [], socialDraftsCreated: 0 }
  
  const [currentYearPhases, nextYearPhases] = await Promise.all([fetchUsnoMoonPhases(currentYear), fetchUsnoMoonPhases(currentYear + 1)])
  const allPhases = [...currentYearPhases, ...nextYearPhases]
  results.fetched = allPhases.length
  
  for (const phase of allPhases) {
    const eventRecord = convertMoonPhaseToEvent(phase)
    const { data, error } = await supabase.from('mission_events').upsert(eventRecord, { onConflict: 'event_hash', ignoreDuplicates: true }).select()
    
    if (error) {
      if (error.code === '23505') results.duplicates++
      else results.errors.push({ phase: phase.phase, date: `${phase.year}-${phase.month}-${phase.day}`, error: error.message })
    } else if (data && data.length > 0) {
      results.inserted++
      const insertedEvent = data[0]
      if (insertedEvent.social_draft_eligible && !insertedEvent.social_draft_created) {
        if (await createMoonPhaseDraft(supabase, insertedEvent)) results.socialDraftsCreated++
      }
    }
  }
  return results
}

async function syncEclipses(supabase) {
  const currentYear = new Date().getFullYear()
  const results = { solarEclipses: { fetched: 0, inserted: 0, duplicates: 0, errors: [] }, lunarEclipses: { fetched: 0, inserted: 0, duplicates: 0, errors: [] }, socialDraftsCreated: 0 }
  
  // Solar eclipses from USNO
  const yearsToFetch = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3]
  const solarEclipseResults = await Promise.all(yearsToFetch.map(year => fetchUsnoSolarEclipses(year)))
  const allSolarEclipses = solarEclipseResults.flat()
  results.solarEclipses.fetched = allSolarEclipses.length
  
  for (const eclipse of allSolarEclipses) {
    const eventRecord = convertSolarEclipseToEvent(eclipse)
    const { data, error } = await supabase.from('mission_events').upsert(eventRecord, { onConflict: 'event_hash', ignoreDuplicates: true }).select()
    
    if (error) {
      if (error.code === '23505') results.solarEclipses.duplicates++
      else results.solarEclipses.errors.push({ eclipse: eclipse.event_name, error: error.message })
    } else if (data && data.length > 0) {
      results.solarEclipses.inserted++
      const insertedEvent = data[0]
      if (insertedEvent.social_draft_eligible && !insertedEvent.social_draft_created) {
        if (await createEclipseDraft(supabase, insertedEvent)) results.socialDraftsCreated++
      }
    }
  }
  
  // Lunar eclipses from static data
  const now = new Date()
  const futureLunarEclipses = LUNAR_ECLIPSES.filter(e => new Date(e.date) > now)
  results.lunarEclipses.fetched = futureLunarEclipses.length
  
  for (const eclipse of futureLunarEclipses) {
    const eventRecord = convertLunarEclipseToEvent(eclipse)
    const { data, error } = await supabase.from('mission_events').upsert(eventRecord, { onConflict: 'event_hash', ignoreDuplicates: true }).select()
    
    if (error) {
      if (error.code === '23505') results.lunarEclipses.duplicates++
      else results.lunarEclipses.errors.push({ eclipse: `${eclipse.type} lunar eclipse on ${eclipse.date}`, error: error.message })
    } else if (data && data.length > 0) {
      results.lunarEclipses.inserted++
      const insertedEvent = data[0]
      if (insertedEvent.social_draft_eligible && !insertedEvent.social_draft_created) {
        if (await createEclipseDraft(supabase, insertedEvent)) results.socialDraftsCreated++
      }
    }
  }
  
  return results
}

// ============ MAIN HANDLER ============

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  if (req.method === 'OPTIONS') return res.status(200).end()
  
  if (!isSupabaseConfigured()) {
    return res.status(500).json({ error: 'Supabase not configured', message: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables' })
  }
  
  const supabase = getSupabase()
  const syncType = req.query.type || 'all' // 'moon', 'eclipses', or 'all'
  
  try {
    const response = { success: true, timestamp: new Date().toISOString() }
    
    if (syncType === 'moon' || syncType === 'all') {
      response.moonPhases = await syncMoonPhases(supabase)
    }
    
    if (syncType === 'eclipses' || syncType === 'all') {
      response.eclipses = await syncEclipses(supabase)
    }
    
    response.message = `Sky events sync completed (type: ${syncType})`
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('Sky events sync error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
