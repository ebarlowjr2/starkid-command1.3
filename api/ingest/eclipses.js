// api/ingest/eclipses.js
// Serverless function to fetch eclipse data from USNO and NASA sources
// Scheduled via Vercel cron (daily)

import crypto from 'crypto'
import { getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

const USNO_API_BASE = 'https://aa.usno.navy.mil/api'

// Lunar eclipse data (USNO doesn't have a lunar eclipse API, so we use curated data)
// Source: NASA GSFC Eclipse Web Site / timeanddate.com
const LUNAR_ECLIPSES = [
  {
    date: '2026-03-03',
    type: 'total',
    peak_time: '11:34',
    visibility: 'Americas, Europe, Africa, western Asia',
    duration_totality: '58 min',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2026-08-28',
    type: 'partial',
    peak_time: '04:14',
    visibility: 'Americas, Europe, Africa, Asia, Australia',
    magnitude: 0.93,
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2027-02-20',
    type: 'penumbral',
    peak_time: '23:13',
    visibility: 'Americas, Europe, Africa, Asia',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2027-07-18',
    type: 'penumbral',
    peak_time: '16:03',
    visibility: 'Asia, Australia, Pacific, Americas',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2027-08-17',
    type: 'penumbral',
    peak_time: '07:14',
    visibility: 'Pacific, Americas, Europe, Africa',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2028-01-12',
    type: 'partial',
    peak_time: '04:14',
    visibility: 'Americas, Europe, Africa',
    magnitude: 0.07,
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2028-07-06',
    type: 'partial',
    peak_time: '18:20',
    visibility: 'Australia, Asia, Antarctica',
    magnitude: 0.39,
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2028-12-31',
    type: 'total',
    peak_time: '16:52',
    visibility: 'Europe, Africa, Asia, Australia',
    duration_totality: '71 min',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2029-06-26',
    type: 'total',
    peak_time: '03:22',
    visibility: 'Americas, Europe, Africa, Middle East',
    duration_totality: '102 min',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
  {
    date: '2029-12-20',
    type: 'total',
    peak_time: '22:42',
    visibility: 'Americas, Europe, Africa, Asia',
    duration_totality: '54 min',
    nasa_url: 'https://science.nasa.gov/eclipses/future-eclipses/',
  },
]

function generateEventHash(category, subtype, title, eventTimeUtc) {
  const data = `${category}${subtype}${title}${eventTimeUtc}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

async function fetchUsnoSolarEclipses(year) {
  const url = `${USNO_API_BASE}/eclipses/solar/year?year=${year}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`USNO API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.eclipses_in_year || !Array.isArray(data.eclipses_in_year)) {
      console.warn(`No solar eclipse data returned for year ${year}`)
      return []
    }
    
    return data.eclipses_in_year.map(eclipse => {
      const eclipseType = extractEclipseType(eclipse.event)
      return {
        year: eclipse.year,
        month: eclipse.month,
        day: eclipse.day,
        type: 'solar',
        subtype: eclipseType,
        event_name: eclipse.event,
      }
    })
  } catch (error) {
    console.error(`Error fetching USNO solar eclipse data for year ${year}:`, error)
    return []
  }
}

function extractEclipseType(eventName) {
  const lower = eventName.toLowerCase()
  if (lower.includes('total')) return 'total'
  if (lower.includes('annular')) return 'annular'
  if (lower.includes('partial')) return 'partial'
  if (lower.includes('hybrid')) return 'hybrid'
  return 'unknown'
}

function convertSolarEclipseToEvent(eclipse) {
  const dateStr = `${eclipse.year}-${String(eclipse.month).padStart(2, '0')}-${String(eclipse.day).padStart(2, '0')}`
  const eventTimeUtc = `${dateStr}T12:00:00Z` // Approximate noon UTC for solar eclipses
  
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
      linkouts: {
        nasa: 'https://science.nasa.gov/eclipses/future-eclipses/',
        usno: `https://aa.usno.navy.mil/data/SolarEclipses`,
        timeanddate: `https://www.timeanddate.com/eclipse/solar/${eclipse.year}-${String(eclipse.month).padStart(2, '0')}-${String(eclipse.day).padStart(2, '0')}`,
      }
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
    total: `A total lunar eclipse! The Moon turns a deep red color as it passes through Earth\'s shadow. ${eclipse.duration_totality ? `Totality lasts ${eclipse.duration_totality}.` : ''}`,
    partial: `A partial lunar eclipse where ${eclipse.magnitude ? `${Math.round(eclipse.magnitude * 100)}%` : 'part'} of the Moon enters Earth\'s shadow.`,
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
      linkouts: {
        nasa: eclipse.nasa_url,
        timeanddate: `https://www.timeanddate.com/eclipse/lunar/${eclipse.date}`,
      }
    },
    social_draft_eligible: eclipse.type === 'total',
    social_draft_created: false
  }
}

async function createSocialDraft(supabase, event) {
  const eclipseType = event.metadata?.eclipse_type || 'eclipse'
  const eclipseSubtype = event.metadata?.eclipse_subtype || ''
  const eventDate = new Date(event.event_time_utc)
  const dateStr = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
  
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
  } else if (eclipseType === 'lunar') {
    if (eclipseSubtype === 'total') {
      body = `Blood Moon Alert! On ${dateStr}, watch the Moon turn deep red during a total lunar eclipse. No special equipment needed - just find a clear view of the sky!`
      hashtags.push('#LunarEclipse', '#BloodMoon')
    }
  }
  
  if (!body) return // Skip draft for non-high-signal eclipses
  
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
      event_subtype: event.subtype,
      eclipse_type: eclipseType,
      eclipse_subtype: eclipseSubtype
    }
  }
  
  const { error } = await supabase
    .from('social_posts')
    .insert(draft)
  
  if (error) {
    console.error('Error creating social draft:', error)
  } else {
    await supabase
      .from('mission_events')
      .update({ social_draft_created: true })
      .eq('id', event.id)
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (!isSupabaseConfigured()) {
    return res.status(500).json({
      error: 'Supabase not configured',
      message: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
    })
  }
  
  const supabase = getSupabase()
  const currentYear = new Date().getFullYear()
  
  const results = {
    solarEclipses: { fetched: 0, inserted: 0, duplicates: 0, errors: [] },
    lunarEclipses: { fetched: 0, inserted: 0, duplicates: 0, errors: [] },
    socialDraftsCreated: 0
  }
  
  try {
    // Fetch solar eclipses for current year and next 3 years
    const yearsToFetch = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3]
    const solarEclipsePromises = yearsToFetch.map(year => fetchUsnoSolarEclipses(year))
    const solarEclipseResults = await Promise.all(solarEclipsePromises)
    const allSolarEclipses = solarEclipseResults.flat()
    
    results.solarEclipses.fetched = allSolarEclipses.length
    
    // Process solar eclipses
    for (const eclipse of allSolarEclipses) {
      const eventRecord = convertSolarEclipseToEvent(eclipse)
      
      const { data, error } = await supabase
        .from('mission_events')
        .upsert(eventRecord, { 
          onConflict: 'event_hash',
          ignoreDuplicates: true 
        })
        .select()
      
      if (error) {
        if (error.code === '23505') {
          results.solarEclipses.duplicates++
        } else {
          results.solarEclipses.errors.push({
            eclipse: eclipse.event_name,
            error: error.message
          })
        }
      } else if (data && data.length > 0) {
        results.solarEclipses.inserted++
        
        const insertedEvent = data[0]
        if (insertedEvent.social_draft_eligible && !insertedEvent.social_draft_created) {
          await createSocialDraft(supabase, insertedEvent)
          results.socialDraftsCreated++
        }
      }
    }
    
    // Process lunar eclipses from static data
    const now = new Date()
    const futureLunarEclipses = LUNAR_ECLIPSES.filter(e => new Date(e.date) > now)
    results.lunarEclipses.fetched = futureLunarEclipses.length
    
    for (const eclipse of futureLunarEclipses) {
      const eventRecord = convertLunarEclipseToEvent(eclipse)
      
      const { data, error } = await supabase
        .from('mission_events')
        .upsert(eventRecord, { 
          onConflict: 'event_hash',
          ignoreDuplicates: true 
        })
        .select()
      
      if (error) {
        if (error.code === '23505') {
          results.lunarEclipses.duplicates++
        } else {
          results.lunarEclipses.errors.push({
            eclipse: `${eclipse.type} lunar eclipse on ${eclipse.date}`,
            error: error.message
          })
        }
      } else if (data && data.length > 0) {
        results.lunarEclipses.inserted++
        
        const insertedEvent = data[0]
        if (insertedEvent.social_draft_eligible && !insertedEvent.social_draft_created) {
          await createSocialDraft(supabase, insertedEvent)
          results.socialDraftsCreated++
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Eclipse data sync completed',
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Eclipse sync error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      results
    })
  }
}
