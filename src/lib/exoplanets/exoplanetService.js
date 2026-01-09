// src/lib/exoplanets/exoplanetService.js
// NASA Exoplanet Archive data with caching
// Note: The NASA Exoplanet Archive TAP API doesn't support CORS for browser requests
// This module uses curated sample data from confirmed NASA exoplanet discoveries

import { getWithTTL, setWithTTL } from '../cache.js'

const CACHE_KEY = 'exoplanets:confirmed:v1'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// Curated sample data from NASA Exoplanet Archive
// These are real confirmed exoplanets from NASA's database
// Data source: https://exoplanetarchive.ipac.caltech.edu/
const SAMPLE_EXOPLANETS = [
  { name: 'Proxima Cen b', hostStar: 'Proxima Centauri', distanceLightYears: 4.2, discoveryYear: 2016, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.08, equilibriumTemp: 234 },
  { name: 'Proxima Cen d', hostStar: 'Proxima Centauri', distanceLightYears: 4.2, discoveryYear: 2022, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 0.26, equilibriumTemp: null },
  { name: 'Barnard b', hostStar: "Barnard's Star", distanceLightYears: 6.0, discoveryYear: 2018, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 105 },
  { name: 'Ross 128 b', hostStar: 'Ross 128', distanceLightYears: 11.0, discoveryYear: 2017, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.11, equilibriumTemp: 280 },
  { name: 'Luyten b', hostStar: "Luyten's Star", distanceLightYears: 12.2, discoveryYear: 2017, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.36, equilibriumTemp: 259 },
  { name: 'Wolf 1061 c', hostStar: 'Wolf 1061', distanceLightYears: 13.8, discoveryYear: 2015, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.66, equilibriumTemp: 223 },
  { name: 'Gliese 667 C c', hostStar: 'Gliese 667 C', distanceLightYears: 23.6, discoveryYear: 2011, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.54, equilibriumTemp: 277 },
  { name: 'Gliese 667 C e', hostStar: 'Gliese 667 C', distanceLightYears: 23.6, discoveryYear: 2013, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.40, equilibriumTemp: 213 },
  { name: 'Gliese 667 C f', hostStar: 'Gliese 667 C', distanceLightYears: 23.6, discoveryYear: 2013, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.30, equilibriumTemp: 195 },
  { name: 'TRAPPIST-1 b', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2016, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.12, equilibriumTemp: 400 },
  { name: 'TRAPPIST-1 c', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2016, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.10, equilibriumTemp: 342 },
  { name: 'TRAPPIST-1 d', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2017, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 0.77, equilibriumTemp: 288 },
  { name: 'TRAPPIST-1 e', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2017, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 0.92, equilibriumTemp: 251 },
  { name: 'TRAPPIST-1 f', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2017, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.04, equilibriumTemp: 219 },
  { name: 'TRAPPIST-1 g', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2017, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.13, equilibriumTemp: 199 },
  { name: 'TRAPPIST-1 h', hostStar: 'TRAPPIST-1', distanceLightYears: 39.6, discoveryYear: 2017, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 0.76, equilibriumTemp: 173 },
  { name: 'LHS 1140 b', hostStar: 'LHS 1140', distanceLightYears: 40.7, discoveryYear: 2017, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.73, equilibriumTemp: 235 },
  { name: 'LHS 1140 c', hostStar: 'LHS 1140', distanceLightYears: 40.7, discoveryYear: 2018, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.27, equilibriumTemp: 400 },
  { name: 'Kepler-442 b', hostStar: 'Kepler-442', distanceLightYears: 112.0, discoveryYear: 2015, discoveryMethod: 'Transit', starType: 'K-type (Orange)', radiusEarth: 1.34, equilibriumTemp: 233 },
  { name: 'Kepler-62 e', hostStar: 'Kepler-62', distanceLightYears: 990.0, discoveryYear: 2013, discoveryMethod: 'Transit', starType: 'K-type (Orange)', radiusEarth: 1.61, equilibriumTemp: 270 },
  { name: 'Kepler-62 f', hostStar: 'Kepler-62', distanceLightYears: 990.0, discoveryYear: 2013, discoveryMethod: 'Transit', starType: 'K-type (Orange)', radiusEarth: 1.41, equilibriumTemp: 208 },
  { name: 'Kepler-186 f', hostStar: 'Kepler-186', distanceLightYears: 582.0, discoveryYear: 2014, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.17, equilibriumTemp: 188 },
  { name: 'Kepler-452 b', hostStar: 'Kepler-452', distanceLightYears: 1402.0, discoveryYear: 2015, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 1.63, equilibriumTemp: 265 },
  { name: 'Kepler-22 b', hostStar: 'Kepler-22', distanceLightYears: 635.0, discoveryYear: 2011, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 2.38, equilibriumTemp: 262 },
  { name: 'Kepler-69 c', hostStar: 'Kepler-69', distanceLightYears: 2700.0, discoveryYear: 2013, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 1.71, equilibriumTemp: 299 },
  { name: 'Kepler-1649 c', hostStar: 'Kepler-1649', distanceLightYears: 301.0, discoveryYear: 2020, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.06, equilibriumTemp: 234 },
  { name: 'TOI-700 d', hostStar: 'TOI-700', distanceLightYears: 101.4, discoveryYear: 2020, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 1.14, equilibriumTemp: 269 },
  { name: 'TOI-700 e', hostStar: 'TOI-700', distanceLightYears: 101.4, discoveryYear: 2023, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 0.95, equilibriumTemp: 273 },
  { name: 'K2-18 b', hostStar: 'K2-18', distanceLightYears: 124.0, discoveryYear: 2015, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 2.61, equilibriumTemp: 284 },
  { name: 'HD 40307 g', hostStar: 'HD 40307', distanceLightYears: 42.0, discoveryYear: 2012, discoveryMethod: 'Radial Velocity', starType: 'K-type (Orange)', radiusEarth: null, equilibriumTemp: 225 },
  { name: 'Tau Ceti e', hostStar: 'Tau Ceti', distanceLightYears: 11.9, discoveryYear: 2012, discoveryMethod: 'Radial Velocity', starType: 'G-type (Yellow)', radiusEarth: null, equilibriumTemp: 350 },
  { name: 'Tau Ceti f', hostStar: 'Tau Ceti', distanceLightYears: 11.9, discoveryYear: 2012, discoveryMethod: 'Radial Velocity', starType: 'G-type (Yellow)', radiusEarth: null, equilibriumTemp: 200 },
  { name: '55 Cancri e', hostStar: '55 Cancri', distanceLightYears: 41.0, discoveryYear: 2004, discoveryMethod: 'Radial Velocity', starType: 'G-type (Yellow)', radiusEarth: 1.88, equilibriumTemp: 2573 },
  { name: 'GJ 1002 b', hostStar: 'GJ 1002', distanceLightYears: 15.8, discoveryYear: 2022, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 231 },
  { name: 'GJ 1002 c', hostStar: 'GJ 1002', distanceLightYears: 15.8, discoveryYear: 2022, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 182 },
  { name: 'Teegarden b', hostStar: "Teegarden's Star", distanceLightYears: 12.5, discoveryYear: 2019, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.05, equilibriumTemp: 264 },
  { name: 'Teegarden c', hostStar: "Teegarden's Star", distanceLightYears: 12.5, discoveryYear: 2019, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 1.11, equilibriumTemp: 199 },
  { name: 'GJ 357 d', hostStar: 'GJ 357', distanceLightYears: 31.0, discoveryYear: 2019, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 220 },
  { name: 'GJ 273 b', hostStar: 'GJ 273', distanceLightYears: 12.4, discoveryYear: 2017, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 259 },
  { name: 'HD 219134 b', hostStar: 'HD 219134', distanceLightYears: 21.3, discoveryYear: 2015, discoveryMethod: 'Radial Velocity', starType: 'K-type (Orange)', radiusEarth: 1.60, equilibriumTemp: 1015 },
  { name: 'HD 219134 c', hostStar: 'HD 219134', distanceLightYears: 21.3, discoveryYear: 2015, discoveryMethod: 'Radial Velocity', starType: 'K-type (Orange)', radiusEarth: 1.51, equilibriumTemp: 782 },
  { name: 'Gliese 581 d', hostStar: 'Gliese 581', distanceLightYears: 20.4, discoveryYear: 2007, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 220 },
  { name: 'Gliese 581 g', hostStar: 'Gliese 581', distanceLightYears: 20.4, discoveryYear: 2010, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 236 },
  { name: '51 Pegasi b', hostStar: '51 Pegasi', distanceLightYears: 50.9, discoveryYear: 1995, discoveryMethod: 'Radial Velocity', starType: 'G-type (Yellow)', radiusEarth: 15.47, equilibriumTemp: 1260 },
  { name: 'HD 209458 b', hostStar: 'HD 209458', distanceLightYears: 157.0, discoveryYear: 1999, discoveryMethod: 'Radial Velocity', starType: 'G-type (Yellow)', radiusEarth: 15.12, equilibriumTemp: 1449 },
  { name: 'WASP-12 b', hostStar: 'WASP-12', distanceLightYears: 1410.0, discoveryYear: 2008, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 20.56, equilibriumTemp: 2516 },
  { name: 'WASP-17 b', hostStar: 'WASP-17', distanceLightYears: 1300.0, discoveryYear: 2009, discoveryMethod: 'Transit', starType: 'F-type (Yellow-White)', radiusEarth: 22.93, equilibriumTemp: 1771 },
  { name: 'HR 8799 b', hostStar: 'HR 8799', distanceLightYears: 129.0, discoveryYear: 2008, discoveryMethod: 'Direct Imaging', starType: 'A-type (White)', radiusEarth: 12.0, equilibriumTemp: 870 },
  { name: 'HR 8799 c', hostStar: 'HR 8799', distanceLightYears: 129.0, discoveryYear: 2008, discoveryMethod: 'Direct Imaging', starType: 'A-type (White)', radiusEarth: 12.0, equilibriumTemp: 1090 },
  { name: 'HR 8799 d', hostStar: 'HR 8799', distanceLightYears: 129.0, discoveryYear: 2008, discoveryMethod: 'Direct Imaging', starType: 'A-type (White)', radiusEarth: 12.0, equilibriumTemp: 1200 },
  { name: 'HR 8799 e', hostStar: 'HR 8799', distanceLightYears: 129.0, discoveryYear: 2010, discoveryMethod: 'Direct Imaging', starType: 'A-type (White)', radiusEarth: 12.0, equilibriumTemp: 1150 },
  { name: 'Beta Pictoris b', hostStar: 'Beta Pictoris', distanceLightYears: 63.4, discoveryYear: 2008, discoveryMethod: 'Direct Imaging', starType: 'A-type (White)', radiusEarth: 18.0, equilibriumTemp: 1724 },
  { name: 'Beta Pictoris c', hostStar: 'Beta Pictoris', distanceLightYears: 63.4, discoveryYear: 2019, discoveryMethod: 'Radial Velocity', starType: 'A-type (White)', radiusEarth: 12.0, equilibriumTemp: null },
  { name: 'Fomalhaut b', hostStar: 'Fomalhaut', distanceLightYears: 25.1, discoveryYear: 2008, discoveryMethod: 'Direct Imaging', starType: 'A-type (White)', radiusEarth: null, equilibriumTemp: null },
  { name: 'PSR B1257+12 b', hostStar: 'PSR B1257+12', distanceLightYears: 2300.0, discoveryYear: 1992, discoveryMethod: 'Pulsar Timing', starType: 'Unknown', radiusEarth: 0.19, equilibriumTemp: null },
  { name: 'PSR B1257+12 c', hostStar: 'PSR B1257+12', distanceLightYears: 2300.0, discoveryYear: 1992, discoveryMethod: 'Pulsar Timing', starType: 'Unknown', radiusEarth: 3.90, equilibriumTemp: null },
  { name: 'OGLE-2005-BLG-390L b', hostStar: 'OGLE-2005-BLG-390L', distanceLightYears: 21500.0, discoveryYear: 2006, discoveryMethod: 'Microlensing', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: 50 },
  { name: 'MOA-2007-BLG-192L b', hostStar: 'MOA-2007-BLG-192L', distanceLightYears: 3000.0, discoveryYear: 2008, discoveryMethod: 'Microlensing', starType: 'M-type (Red Dwarf)', radiusEarth: null, equilibriumTemp: null },
  { name: 'Gliese 436 b', hostStar: 'Gliese 436', distanceLightYears: 31.8, discoveryYear: 2004, discoveryMethod: 'Radial Velocity', starType: 'M-type (Red Dwarf)', radiusEarth: 4.10, equilibriumTemp: 712 },
  { name: 'GJ 1214 b', hostStar: 'GJ 1214', distanceLightYears: 48.0, discoveryYear: 2009, discoveryMethod: 'Transit', starType: 'M-type (Red Dwarf)', radiusEarth: 2.68, equilibriumTemp: 596 },
  { name: 'HD 189733 b', hostStar: 'HD 189733', distanceLightYears: 64.5, discoveryYear: 2005, discoveryMethod: 'Transit', starType: 'K-type (Orange)', radiusEarth: 12.74, equilibriumTemp: 1191 },
  { name: 'Kepler-10 b', hostStar: 'Kepler-10', distanceLightYears: 608.0, discoveryYear: 2011, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 1.47, equilibriumTemp: 2169 },
  { name: 'Kepler-16 b', hostStar: 'Kepler-16', distanceLightYears: 245.0, discoveryYear: 2011, discoveryMethod: 'Transit', starType: 'K-type (Orange)', radiusEarth: 8.45, equilibriumTemp: 188 },
  { name: 'Kepler-11 b', hostStar: 'Kepler-11', distanceLightYears: 2108.0, discoveryYear: 2010, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 1.80, equilibriumTemp: 945 },
  { name: 'Kepler-11 c', hostStar: 'Kepler-11', distanceLightYears: 2108.0, discoveryYear: 2010, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 2.87, equilibriumTemp: 761 },
  { name: 'Kepler-11 d', hostStar: 'Kepler-11', distanceLightYears: 2108.0, discoveryYear: 2010, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 3.12, equilibriumTemp: 643 },
  { name: 'Kepler-11 e', hostStar: 'Kepler-11', distanceLightYears: 2108.0, discoveryYear: 2010, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 4.19, equilibriumTemp: 548 },
  { name: 'Kepler-11 f', hostStar: 'Kepler-11', distanceLightYears: 2108.0, discoveryYear: 2010, discoveryMethod: 'Transit', starType: 'G-type (Yellow)', radiusEarth: 2.49, equilibriumTemp: 470 },
  { name: 'CoRoT-7 b', hostStar: 'CoRoT-7', distanceLightYears: 489.0, discoveryYear: 2009, discoveryMethod: 'Transit', starType: 'K-type (Orange)', radiusEarth: 1.58, equilibriumTemp: 1810 },
  { name: 'Epsilon Eridani b', hostStar: 'Epsilon Eridani', distanceLightYears: 10.5, discoveryYear: 2000, discoveryMethod: 'Radial Velocity', starType: 'K-type (Orange)', radiusEarth: null, equilibriumTemp: 150 },
]

// Normalize discovery method names for display
function normalizeDiscoveryMethod(method) {
  if (!method) return 'Unknown'
  const methodMap = {
    'Transit': 'Transit',
    'Radial Velocity': 'Radial Velocity',
    'Imaging': 'Direct Imaging',
    'Microlensing': 'Microlensing',
    'Transit Timing Variations': 'Transit Timing',
    'Eclipse Timing Variations': 'Eclipse Timing',
    'Pulsar Timing': 'Pulsar Timing',
    'Pulsation Timing Variations': 'Pulsation Timing',
    'Orbital Brightness Modulation': 'Brightness Modulation',
    'Astrometry': 'Astrometry',
    'Disk Kinematics': 'Disk Kinematics'
  }
  return methodMap[method] || method
}

// Normalize star type to main classification
function normalizeStarType(specType) {
  if (!specType) return 'Unknown'
  // Extract first letter (spectral class: O, B, A, F, G, K, M)
  const match = specType.match(/^([OBAFGKM])/i)
  if (match) {
    const type = match[1].toUpperCase()
    const typeNames = {
      'O': 'O-type (Blue)',
      'B': 'B-type (Blue-White)',
      'A': 'A-type (White)',
      'F': 'F-type (Yellow-White)',
      'G': 'G-type (Yellow)',
      'K': 'K-type (Orange)',
      'M': 'M-type (Red Dwarf)'
    }
    return typeNames[type] || `${type}-type`
  }
  return specType.substring(0, 10)
}

// Main function to get exoplanet data (with caching)
// Uses sample data since NASA Exoplanet Archive TAP API doesn't support CORS
export async function getExoplanets() {
  // Check cache first
  const cached = getWithTTL(CACHE_KEY)
  if (cached) {
    return cached
  }

  // Use sample data (sorted by distance)
  const sortedData = [...SAMPLE_EXOPLANETS].sort(
    (a, b) => (a.distanceLightYears || Infinity) - (b.distanceLightYears || Infinity)
  )

  // Cache the data
  setWithTTL(CACHE_KEY, sortedData, CACHE_TTL)

  return sortedData
}

// Get discovery statistics
export function getDiscoveryStats(planets) {
  if (!planets || planets.length === 0) {
    return {
      totalConfirmed: 0,
      earthSizedCount: 0,
      closestWorld: null
    }
  }

  // Earth-sized: radius between 0.8 and 1.5 Earth radii
  const earthSized = planets.filter(p => 
    p.radiusEarth !== null && 
    p.radiusEarth >= 0.8 && 
    p.radiusEarth <= 1.5
  )

  // Closest world with valid distance
  const closestWorld = planets.find(p => p.distanceLightYears !== null)

  return {
    totalConfirmed: planets.length,
    earthSizedCount: earthSized.length,
    closestWorld: closestWorld || null
  }
}

// Get potentially habitable candidates
// Criteria: distance < 50 ly, has temp + radius data, radius <= 1.6 Earth radii
export function getHabitableCandidates(planets, maxDistanceLY = 50) {
  if (!planets || planets.length === 0) return []

  return planets.filter(p => 
    p.distanceLightYears !== null &&
    p.distanceLightYears <= maxDistanceLY &&
    p.radiusEarth !== null &&
    p.radiusEarth <= 1.6 &&
    p.equilibriumTemp !== null
  ).slice(0, 10) // Limit to top 10
}

// Get unique discovery methods for filtering
export function getDiscoveryMethods(planets) {
  if (!planets || planets.length === 0) return []
  const methods = [...new Set(planets.map(p => p.discoveryMethod))]
  return methods.filter(m => m !== 'Unknown').sort()
}

// Get unique star types for filtering
export function getStarTypes(planets) {
  if (!planets || planets.length === 0) return []
  const types = [...new Set(planets.map(p => p.starType))]
  return types.filter(t => t !== 'Unknown').sort()
}

// Filter planets based on criteria
export function filterPlanets(planets, filters = {}) {
  if (!planets || planets.length === 0) return []

  let filtered = [...planets]

  if (filters.maxDistance !== undefined && filters.maxDistance !== null) {
    filtered = filtered.filter(p => 
      p.distanceLightYears !== null && 
      p.distanceLightYears <= filters.maxDistance
    )
  }

  if (filters.discoveryMethod) {
    filtered = filtered.filter(p => p.discoveryMethod === filters.discoveryMethod)
  }

  if (filters.starType) {
    filtered = filtered.filter(p => p.starType === filters.starType)
  }

  return filtered
}

// Paginate results
export function paginatePlanets(planets, page = 1, perPage = 15) {
  const start = (page - 1) * perPage
  const end = start + perPage
  return {
    data: planets.slice(start, end),
    page,
    perPage,
    total: planets.length,
    totalPages: Math.ceil(planets.length / perPage)
  }
}

// Detection methods educational content
export const DETECTION_METHODS = [
  {
    id: 'transit',
    name: 'Transit Method',
    description: 'When a planet passes in front of its star, it blocks a tiny amount of light. By measuring this dimming, scientists can detect the planet and estimate its size.',
    icon: '◐'
  },
  {
    id: 'radial_velocity',
    name: 'Radial Velocity',
    description: 'A planet\'s gravity causes its star to wobble slightly. By measuring the star\'s movement toward and away from us, scientists can detect orbiting planets.',
    icon: '↔'
  },
  {
    id: 'direct_imaging',
    name: 'Direct Imaging',
    description: 'Using powerful telescopes with special filters, scientists can sometimes photograph planets directly by blocking out the star\'s bright light.',
    icon: '◉'
  },
  {
    id: 'microlensing',
    name: 'Gravitational Microlensing',
    description: 'When a star with a planet passes in front of a distant star, gravity bends and magnifies the light, revealing the planet\'s presence.',
    icon: '◎'
  }
]
