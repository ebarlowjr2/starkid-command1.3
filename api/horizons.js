/**
 * Vercel Serverless Function: NASA JPL Horizons Proxy
 * 
 * Consolidated endpoint for both observer ephemeris and heliocentric vectors.
 * 
 * Mode: observer (default)
 * POST /api/horizons
 * Body: { designation, lat, lon, elevation?, start, stop }
 * 
 * Mode: vectors
 * POST /api/horizons?mode=vectors
 * Body: { targets: string[], datetime: string (ISO) }
 */

const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

// Map friendly names to Horizons command codes (for vectors mode)
const HORIZONS_TARGETS = {
  SUN: '10',
  MERCURY: '199',
  VENUS: '299',
  EARTH: '399',
  MARS: '499',
  JUPITER: '599',
  SATURN: '699',
  URANUS: '799',
  NEPTUNE: '899'
}

// Cache for responses (in-memory, resets on cold start)
const cache = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const VECTORS_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// ============ OBSERVER MODE FUNCTIONS ============

function buildHorizonsParams(designation, lat, lon, elevation, start, stop) {
  const siteCoord = `${lon},${lat},${elevation || 0}`
  
  return new URLSearchParams({
    format: 'json',
    COMMAND: `'${designation}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'OBSERVER',
    CENTER: "'coord@399'",
    SITE_COORD: `'${siteCoord}'`,
    START_TIME: `'${start}'`,
    STOP_TIME: `'${stop}'`,
    STEP_SIZE: "'1 h'",
    QUANTITIES: "'1,4,9'",
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

function parseHorizonsResponse(data, designation) {
  if (!data.result) {
    throw new Error('Invalid Horizons response')
  }

  const result = data.result
  
  if (result.includes('No matches found') || result.includes('Cannot find')) {
    throw new Error(`Comet ${designation} not found in Horizons database`)
  }

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

  const aboveHorizon = observations.filter(o => o.alt > 0)
  
  let bestWindow = null
  if (aboveHorizon.length > 0) {
    const peak = aboveHorizon.reduce((best, curr) => 
      curr.alt > best.alt ? curr : best
    )
    
    const visibleStart = aboveHorizon[0]
    const visibleEnd = aboveHorizon[aboveHorizon.length - 1]
    
    const direction = getDirectionText(peak.az, peak.alt)
    
    bestWindow = {
      start: visibleStart.timestamp,
      end: visibleEnd.timestamp,
      peakAlt: peak.alt,
      peakAz: peak.az,
      note: direction
    }
  }

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

  const timeNote = alt > 0 ? '' : ' (below horizon)'
  
  return `${altDesc} ${dirName}${timeNote}`
}

// ============ VECTORS MODE FUNCTIONS ============

function buildHorizonsVectorUrl(command, datetimeIso) {
  const dt = datetimeIso.replace('T', ' ').replace('Z', '').slice(0, 16)
  
  const params = new URLSearchParams({
    format: 'text',
    COMMAND: `'${command}'`,
    EPHEM_TYPE: 'VECTORS',
    CENTER: "'500@10'",
    REF_PLANE: 'ECLIPTIC',
    OUT_UNITS: 'AU-D',
    VEC_TABLE: '1',
    CSV_FORMAT: 'YES',
    TLIST: `'${dt}'`
  })
  
  return `${HORIZONS_API}?${params.toString()}`
}

function parseHorizonsVector(raw) {
  const soe = raw.indexOf('$$SOE')
  const eoe = raw.indexOf('$$EOE')
  
  if (soe === -1 || eoe === -1 || eoe <= soe) {
    return null
  }
  
  const block = raw.slice(soe, eoe)
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
  
  const dataLine = lines.find(l => 
    l.includes(',') && 
    /-?\d+\.\d+/.test(l) && 
    !l.startsWith('$$SOE')
  )
  
  if (!dataLine) {
    return null
  }
  
  const parts = dataLine.split(',').map(p => p.trim())
  
  const floats = parts
    .map(p => Number(p))
    .filter(n => Number.isFinite(n))
  
  if (floats.length < 4) {
    return null
  }
  
  return {
    x: floats[1],
    y: floats[2],
    z: floats[3]
  }
}

// ============ HANDLER FUNCTIONS ============

async function handleObserverMode(req, res, params) {
  const { designation, lat, lon, elevation = 0, start, stop } = params

  if (!designation) {
    return res.status(400).json({ error: 'Missing required parameter: designation' })
  }
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: lat, lon' })
  }
  if (!start || !stop) {
    return res.status(400).json({ error: 'Missing required parameters: start, stop' })
  }

  const cacheKey = `observer:${designation}:${lat}:${lon}:${start}:${stop}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('Cache-Control', 'public, max-age=900')
    return res.status(200).json(cached.data)
  }

  try {
    const queryParams = buildHorizonsParams(designation, lat, lon, elevation, start, stop)
    const horizonsUrl = `${HORIZONS_API}?${queryParams.toString()}`
    
    const response = await fetch(horizonsUrl)
    
    if (!response.ok) {
      throw new Error(`Horizons API returned ${response.status}`)
    }

    const data = await response.json()
    const parsed = parseHorizonsResponse(data, designation)

    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: parsed
    })

    cleanCache()

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

async function handleVectorsMode(req, res, params) {
  const { targets, datetime } = params
  
  if (!Array.isArray(targets) || targets.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid payload. Expect { targets: string[], datetime: string }' 
    })
  }
  
  if (typeof datetime !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid payload. datetime must be an ISO string' 
    })
  }
  
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
  
  try {
    const positions = {}
    
    for (const t of targets) {
      const cacheKey = `vectors:${t}:${datetime}`
      const cached = cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < VECTORS_CACHE_TTL) {
        positions[t] = cached.data
        continue
      }
      
      const command = HORIZONS_TARGETS[t.toUpperCase()] || t
      const url = buildHorizonsVectorUrl(command, datetime)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`Horizons fetch failed for ${t}: ${response.status} ${text.slice(0, 200)}`)
      }
      
      const raw = await response.text()
      const vec = parseHorizonsVector(raw)
      
      if (!vec) {
        console.error(`Failed to parse Horizons vectors for ${t}`)
        continue
      }
      
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: vec
      })
      
      positions[t] = vec
    }
    
    cleanCache()
    
    return res.status(200).json({
      datetime,
      units: 'AU',
      frame: 'heliocentric-ecliptic',
      positions
    })
    
  } catch (error) {
    console.error('Horizons vectors API error:', error.message)
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch vector data from Horizons' 
    })
  }
}

function cleanCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    const ttl = key.startsWith('vectors:') ? VECTORS_CACHE_TTL : CACHE_TTL
    if (now - value.timestamp > ttl) {
      cache.delete(key)
    }
  }
}

// ============ MAIN HANDLER ============

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Determine mode from query parameter
  const mode = req.query?.mode || 'observer'
  
  // Get params from body or query
  let params
  if (req.method === 'POST') {
    params = req.body || {}
  } else if (req.method === 'GET') {
    params = req.query || {}
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (mode === 'vectors') {
    return handleVectorsMode(req, res, params)
  } else {
    return handleObserverMode(req, res, params)
  }
}
