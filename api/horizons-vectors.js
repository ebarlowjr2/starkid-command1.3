/**
 * Vercel Serverless Function: NASA JPL Horizons Vectors Proxy
 * 
 * Returns heliocentric ecliptic Cartesian coordinates (x,y,z in AU)
 * for planets and comets at a given timestamp.
 * 
 * POST /api/horizons-vectors
 * Body: { targets: string[], datetime: string (ISO) }
 */

const HORIZONS_API = 'https://ssd.jpl.nasa.gov/api/horizons.api'

// Map friendly names to Horizons command codes
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
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Build Horizons URL for vector ephemeris
 */
function buildHorizonsVectorUrl(command, datetimeIso) {
  // Convert ISO to Horizons format: "2025-12-23 16:10"
  const dt = datetimeIso.replace('T', ' ').replace('Z', '').slice(0, 16)
  
  const params = new URLSearchParams({
    format: 'text',
    COMMAND: `'${command}'`,
    EPHEM_TYPE: 'VECTORS',
    CENTER: "'500@10'", // Sun-centered
    REF_PLANE: 'ECLIPTIC',
    OUT_UNITS: 'AU-D',
    VEC_TABLE: '1',
    CSV_FORMAT: 'YES',
    TLIST: `'${dt}'`
  })
  
  return `${HORIZONS_API}?${params.toString()}`
}

/**
 * Parse Horizons vector response to extract X, Y, Z coordinates
 */
function parseHorizonsVector(raw) {
  const soe = raw.indexOf('$$SOE')
  const eoe = raw.indexOf('$$EOE')
  
  if (soe === -1 || eoe === -1 || eoe <= soe) {
    return null
  }
  
  const block = raw.slice(soe, eoe)
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
  
  // Find the first data line (contains comma-separated values with floats)
  const dataLine = lines.find(l => 
    l.includes(',') && 
    /-?\d+\.\d+/.test(l) && 
    !l.startsWith('$$SOE')
  )
  
  if (!dataLine) {
    return null
  }
  
  const parts = dataLine.split(',').map(p => p.trim())
  
  // Extract all numeric values
  const floats = parts
    .map(p => Number(p))
    .filter(n => Number.isFinite(n))
  
  // Need at least 4 floats (JD, X, Y, Z)
  if (floats.length < 4) {
    return null
  }
  
  // Heuristic: floats[1], floats[2], floats[3] are X, Y, Z
  // (floats[0] is typically the Julian Date)
  return {
    x: floats[1],
    y: floats[2],
    z: floats[3]
  }
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
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { targets, datetime } = req.body || {}
  
  // Validate input
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
  
  // Set cache headers
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
  
  try {
    const positions = {}
    
    for (const t of targets) {
      // Check cache first
      const cacheKey = `${t}:${datetime}`
      const cached = cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        positions[t] = cached.data
        continue
      }
      
      // Map target name to Horizons command
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
        // Skip this target but continue with others
        continue
      }
      
      // Cache the result
      cache.set(cacheKey, {
        timestamp: Date.now(),
        data: vec
      })
      
      positions[t] = vec
    }
    
    // Clean old cache entries
    for (const [key, value] of cache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }
    
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
