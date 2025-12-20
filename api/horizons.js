/**
 * Vercel Serverless Function: NASA JPL Horizons Proxy
 * 
 * This endpoint proxies requests to NASA JPL Horizons API,
 * normalizing the output for the mobile app.
 * 
 * POST /api/horizons
 * Body: { designation, lat, lon, elevation?, start, stop }
 */

const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

// Cache for responses (in-memory, resets on cold start)
const cache = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

/**
 * Build the Horizons API query parameters
 */
function buildHorizonsParams(designation, lat, lon, elevation, start, stop) {
  // Format coordinates for Horizons (geodetic)
  const siteCoord = `${lon},${lat},${elevation || 0}`
  
  return new URLSearchParams({
    format: 'json',
    COMMAND: `'${designation}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'OBSERVER',
    CENTER: "'coord@399'", // Earth geocentric with coordinates
    SITE_COORD: `'${siteCoord}'`,
    START_TIME: `'${start}'`,
    STOP_TIME: `'${stop}'`,
    STEP_SIZE: "'1 h'", // Hourly steps
    QUANTITIES: "'1,4,9'", // 1=Astrometric RA/Dec, 4=Apparent AZ/EL, 9=Visual magnitude
    CAL_FORMAT: 'CAL',
    TIME_DIGITS: 'MINUTES',
    ANG_FORMAT: 'DEG',
    APPARENT: 'AIRLESS',
    RANGE_UNITS: 'AU',
    SUPPRESS_RANGE_RATE: 'NO',
    SKIP_DAYLT: 'NO',
    SOLAR_ELONG: "'0,180'",
    EXTRA_PREC: 'NO',
    CSV_FORMAT: 'YES'
  })
}

/**
 * Parse the Horizons API response
 */
function parseHorizonsResponse(data, designation) {
  if (!data.result) {
    throw new Error('Invalid Horizons response')
  }

  const result = data.result
  
  // Check for errors in the response
  if (result.includes('No matches found') || result.includes('Cannot find')) {
    throw new Error(`Comet ${designation} not found in Horizons database`)
  }

  // Extract the ephemeris data section
  const startMarker = '$$SOE'
  const endMarker = '$$EOE'
  const startIdx = result.indexOf(startMarker)
  const endIdx = result.indexOf(endMarker)
  
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not parse ephemeris data from Horizons response')
  }

  const ephemerisSection = result.substring(startIdx + startMarker.length, endIdx).trim()
  const lines = ephemerisSection.split('\n').filter(line => line.trim())

  if (lines.length === 0) {
    throw new Error('No ephemeris data available for the requested time range')
  }

  // Parse CSV lines
  // Format: Date, RA, DEC, AZ, EL, ...
  const observations = []
  
  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim())
    if (parts.length < 5) continue

    const dateStr = parts[0]
    const ra = parts[1]
    const dec = parts[2]
    const az = parseFloat(parts[3])
    const el = parseFloat(parts[4])

    if (isNaN(az) || isNaN(el)) continue

    observations.push({
      timestamp: dateStr,
      ra,
      dec,
      az,
      alt: el
    })
  }

  if (observations.length === 0) {
    throw new Error('Could not parse any valid observations')
  }

  // Find the best viewing window (highest altitude above horizon)
  const aboveHorizon = observations.filter(o => o.alt > 0)
  
  let bestWindow = null
  if (aboveHorizon.length > 0) {
    // Find peak altitude
    const peak = aboveHorizon.reduce((best, curr) => 
      curr.alt > best.alt ? curr : best
    )
    
    // Find start and end of visibility window
    const visibleStart = aboveHorizon[0]
    const visibleEnd = aboveHorizon[aboveHorizon.length - 1]
    
    // Generate direction text
    const direction = getDirectionText(peak.az, peak.alt)
    
    bestWindow = {
      start: visibleStart.timestamp,
      end: visibleEnd.timestamp,
      peakAlt: peak.alt,
      peakAz: peak.az,
      note: direction
    }
  }

  // Return the most recent/current observation
  const current = observations[0]

  return {
    designation,
    timestamp: current.timestamp,
    ra: current.ra,
    dec: current.dec,
    alt: current.alt,
    az: current.az,
    bestWindow
  }
}

/**
 * Convert azimuth to cardinal direction and generate viewing note
 */
function getDirectionText(az, alt) {
  const directions = [
    { min: 337.5, max: 360, name: 'N', full: 'north' },
    { min: 0, max: 22.5, name: 'N', full: 'north' },
    { min: 22.5, max: 67.5, name: 'NE', full: 'northeast' },
    { min: 67.5, max: 112.5, name: 'E', full: 'east' },
    { min: 112.5, max: 157.5, name: 'SE', full: 'southeast' },
    { min: 157.5, max: 202.5, name: 'S', full: 'south' },
    { min: 202.5, max: 247.5, name: 'SW', full: 'southwest' },
    { min: 247.5, max: 292.5, name: 'W', full: 'west' },
    { min: 292.5, max: 337.5, name: 'NW', full: 'northwest' }
  ]

  let dirName = 'the sky'
  for (const d of directions) {
    if (az >= d.min && az < d.max) {
      dirName = `the ${d.full}ern sky`
      break
    }
  }

  let altDesc = ''
  if (alt < 15) {
    altDesc = 'Low in'
  } else if (alt < 45) {
    altDesc = 'Moderately high in'
  } else if (alt < 70) {
    altDesc = 'High in'
  } else {
    altDesc = 'Nearly overhead in'
  }

  // Add time-based context
  const timeNote = alt > 0 ? '' : ' (below horizon)'
  
  return `${altDesc} ${dirName}${timeNote}`
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Accept both GET and POST
  let params
  if (req.method === 'POST') {
    params = req.body
  } else if (req.method === 'GET') {
    params = req.query
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { designation, lat, lon, elevation = 0, start, stop } = params

  // Validate required parameters
  if (!designation) {
    return res.status(400).json({ error: 'Missing required parameter: designation' })
  }
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: lat, lon' })
  }
  if (!start || !stop) {
    return res.status(400).json({ error: 'Missing required parameters: start, stop' })
  }

  // Check cache
  const cacheKey = `${designation}:${lat}:${lon}:${start}:${stop}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('Cache-Control', 'public, max-age=900') // 15 min
    return res.status(200).json(cached.data)
  }

  try {
    // Build and make request to Horizons
    const queryParams = buildHorizonsParams(designation, lat, lon, elevation, start, stop)
    const horizonsUrl = `${HORIZONS_API}?${queryParams.toString()}`
    
    const response = await fetch(horizonsUrl)
    
    if (!response.ok) {
      throw new Error(`Horizons API returned ${response.status}`)
    }

    const data = await response.json()
    const parsed = parseHorizonsResponse(data, designation)

    // Cache the result
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: parsed
    })

    // Clean old cache entries
    for (const [key, value] of cache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }

    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 'public, max-age=900')
    return res.status(200).json(parsed)

  } catch (error) {
    console.error('Horizons API error:', error.message)
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch comet data from Horizons'
    })
  }
}
