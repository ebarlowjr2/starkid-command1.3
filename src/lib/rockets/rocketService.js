import { getWithTTL, setWithTTL } from '../cache.js'

const LL2_BASE_URL = 'https://ll.thespacedevs.com/2.3.0'
const ROCKETS_CACHE_KEY = 'rockets:active:v1'
const ROCKETS_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const ROCKET_DETAIL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function normalizeRocket(raw) {
  const manufacturer = raw.manufacturer?.[0] || raw.families?.[0]?.manufacturer?.[0]
  const family = raw.families?.[0]
  
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name || raw.name,
    description: raw.description || null,
    active: raw.active ?? true,
    reusable: raw.reusable ?? false,
    maidenFlight: raw.maiden_flight || null,
    manufacturerName: manufacturer?.name || 'Unknown',
    manufacturerAbbrev: manufacturer?.abbrev || null,
    countryCode: manufacturer?.country?.[0]?.alpha_2_code || null,
    countryName: manufacturer?.country?.[0]?.name || null,
    imageUrl: raw.image?.image_url || raw.image?.thumbnail_url || null,
    thumbnailUrl: raw.image?.thumbnail_url || raw.image?.image_url || null,
    wikiUrl: raw.wiki_url || null,
    infoUrl: raw.info_url || null,
    leoCapacityKg: raw.leo_capacity || null,
    gtoCapacityKg: raw.gto_capacity || null,
    toThrustKN: raw.to_thrust || null,
    lengthM: raw.length || null,
    diameterM: raw.diameter || null,
    launchMassT: raw.launch_mass || null,
    launchCost: raw.launch_cost || null,
    totalLaunches: raw.total_launch_count || 0,
    successfulLaunches: raw.successful_launches || 0,
    failedLaunches: raw.failed_launches || 0,
    pendingLaunches: raw.pending_launches || 0,
    attemptedLandings: raw.attempted_landings || 0,
    successfulLandings: raw.successful_landings || 0,
    failedLandings: raw.failed_landings || 0,
    familyName: family?.name || null,
    familyDescription: family?.description || null
  }
}

export async function getActiveRockets() {
  const cached = getWithTTL(ROCKETS_CACHE_KEY)
  if (cached) {
    return { rockets: cached, fromCache: true }
  }

  try {
    const response = await fetch(
      `${LL2_BASE_URL}/launcher_configurations/?mode=detailed&active=true&limit=100`
    )
    
    if (!response.ok) {
      throw new Error(`LL2 API error: ${response.status}`)
    }
    
    const data = await response.json()
    let rockets = data.results.map(normalizeRocket)
    
    if (data.next && data.count > rockets.length) {
      const response2 = await fetch(data.next)
      if (response2.ok) {
        const data2 = await response2.json()
        rockets = [...rockets, ...data2.results.map(normalizeRocket)]
      }
    }
    
    rockets.sort((a, b) => a.name.localeCompare(b.name))
    
    setWithTTL(ROCKETS_CACHE_KEY, rockets, ROCKETS_CACHE_TTL)
    
    return { rockets, fromCache: false }
  } catch (error) {
    console.error('Error fetching rockets:', error)
    const stale = getWithTTL(ROCKETS_CACHE_KEY, true)
    if (stale) {
      return { rockets: stale, fromCache: true, stale: true }
    }
    return { rockets: SAMPLE_ROCKETS, fromCache: false, fallback: true }
  }
}

export async function getRocketById(id) {
  const cacheKey = `rockets:detail:${id}:v1`
  const cached = getWithTTL(cacheKey)
  if (cached) {
    return { rocket: cached, fromCache: true }
  }

  try {
    const response = await fetch(
      `${LL2_BASE_URL}/launcher_configurations/${id}/?mode=detailed`
    )
    
    if (!response.ok) {
      throw new Error(`LL2 API error: ${response.status}`)
    }
    
    const data = await response.json()
    const rocket = normalizeRocket(data)
    
    setWithTTL(cacheKey, rocket, ROCKET_DETAIL_CACHE_TTL)
    
    return { rocket, fromCache: false }
  } catch (error) {
    console.error('Error fetching rocket detail:', error)
    const { rockets } = await getActiveRockets()
    const rocket = rockets.find(r => r.id === parseInt(id))
    if (rocket) {
      return { rocket, fromCache: true }
    }
    throw error
  }
}

export function filterRockets(rockets, filters) {
  let filtered = [...rockets]
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(search) ||
      r.fullName?.toLowerCase().includes(search) ||
      r.manufacturerName.toLowerCase().includes(search)
    )
  }
  
  if (filters.manufacturer) {
    filtered = filtered.filter(r => 
      r.manufacturerName === filters.manufacturer ||
      r.manufacturerAbbrev === filters.manufacturer
    )
  }
  
  if (filters.reusable !== undefined && filters.reusable !== null) {
    filtered = filtered.filter(r => r.reusable === filters.reusable)
  }
  
  return filtered
}

export function sortRockets(rockets, sortBy) {
  const sorted = [...rockets]
  
  switch (sortBy) {
    case 'thrust':
      return sorted.sort((a, b) => (b.toThrustKN || 0) - (a.toThrustKN || 0))
    case 'payload':
      return sorted.sort((a, b) => (b.leoCapacityKg || 0) - (a.leoCapacityKg || 0))
    case 'launches':
      return sorted.sort((a, b) => b.totalLaunches - a.totalLaunches)
    case 'name':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
}

export function getUniqueManufacturers(rockets) {
  const manufacturers = new Set()
  rockets.forEach(r => {
    if (r.manufacturerName && r.manufacturerName !== 'Unknown') {
      manufacturers.add(r.manufacturerName)
    }
  })
  return Array.from(manufacturers).sort()
}

export function formatThrust(kN) {
  if (!kN) return 'N/A'
  if (kN >= 1000) {
    return `${(kN / 1000).toFixed(1)} MN`
  }
  return `${kN.toLocaleString()} kN`
}

export function formatPayload(kg) {
  if (!kg) return 'N/A'
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} t`
  }
  return `${kg.toLocaleString()} kg`
}

export function formatLength(m) {
  if (!m) return 'N/A'
  return `${m.toFixed(1)} m`
}

export function formatMass(t) {
  if (!t) return 'N/A'
  return `${t.toLocaleString()} t`
}

const SAMPLE_ROCKETS = [
  {
    id: 164,
    name: 'Falcon 9',
    fullName: 'Falcon 9 Block 5',
    description: 'Falcon 9 is a two-stage rocket designed and manufactured by SpaceX for the reliable and safe transport of satellites and the Dragon spacecraft into orbit.',
    active: true,
    reusable: true,
    maidenFlight: '2018-05-11',
    manufacturerName: 'SpaceX',
    manufacturerAbbrev: 'SpX',
    countryCode: 'US',
    countryName: 'United States of America',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_9_image_20230807133459.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193628.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Falcon_9',
    infoUrl: 'https://www.spacex.com/vehicles/falcon-9/',
    leoCapacityKg: 22800,
    gtoCapacityKg: 8300,
    toThrustKN: 7607,
    lengthM: 70,
    diameterM: 3.65,
    launchMassT: 549,
    launchCost: null,
    totalLaunches: 350,
    successfulLaunches: 348,
    failedLaunches: 2,
    pendingLaunches: 50,
    attemptedLandings: 300,
    successfulLandings: 290,
    failedLandings: 10,
    familyName: 'Falcon',
    familyDescription: 'Family of two-stage partially reusable orbital launch vehicles developed by SpaceX.'
  },
  {
    id: 188,
    name: 'Falcon Heavy',
    fullName: 'Falcon Heavy',
    description: 'Falcon Heavy is a partially reusable heavy-lift launch vehicle designed and manufactured by SpaceX.',
    active: true,
    reusable: true,
    maidenFlight: '2018-02-06',
    manufacturerName: 'SpaceX',
    manufacturerAbbrev: 'SpX',
    countryCode: 'US',
    countryName: 'United States of America',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_heavy_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Falcon_Heavy',
    infoUrl: 'https://www.spacex.com/vehicles/falcon-heavy/',
    leoCapacityKg: 63800,
    gtoCapacityKg: 26700,
    toThrustKN: 22819,
    lengthM: 70,
    diameterM: 12.2,
    launchMassT: 1420,
    launchCost: null,
    totalLaunches: 12,
    successfulLaunches: 12,
    failedLaunches: 0,
    pendingLaunches: 5,
    attemptedLandings: 30,
    successfulLandings: 28,
    failedLandings: 2,
    familyName: 'Falcon',
    familyDescription: 'Family of two-stage partially reusable orbital launch vehicles developed by SpaceX.'
  },
  {
    id: 207,
    name: 'Starship',
    fullName: 'Starship / Super Heavy',
    description: 'Starship is a fully reusable super heavy-lift launch vehicle being developed by SpaceX.',
    active: true,
    reusable: true,
    maidenFlight: '2023-04-20',
    manufacturerName: 'SpaceX',
    manufacturerAbbrev: 'SpX',
    countryCode: 'US',
    countryName: 'United States of America',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/starship_image_20230807133459.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/SpaceX_Starship',
    infoUrl: 'https://www.spacex.com/vehicles/starship/',
    leoCapacityKg: 150000,
    gtoCapacityKg: 21000,
    toThrustKN: 74500,
    lengthM: 121,
    diameterM: 9,
    launchMassT: 5000,
    launchCost: null,
    totalLaunches: 6,
    successfulLaunches: 3,
    failedLaunches: 3,
    pendingLaunches: 10,
    attemptedLandings: 6,
    successfulLandings: 2,
    failedLandings: 4,
    familyName: 'Starship',
    familyDescription: 'Fully reusable super heavy-lift launch vehicle system.'
  },
  {
    id: 169,
    name: 'Atlas V',
    fullName: 'Atlas V',
    description: 'Atlas V is an expendable launch system in the Atlas rocket family.',
    active: true,
    reusable: false,
    maidenFlight: '2002-08-21',
    manufacturerName: 'United Launch Alliance',
    manufacturerAbbrev: 'ULA',
    countryCode: 'US',
    countryName: 'United States of America',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/atlas_v_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Atlas_V',
    infoUrl: 'https://www.ulalaunch.com/rockets/atlas-v',
    leoCapacityKg: 18850,
    gtoCapacityKg: 8900,
    toThrustKN: 4152,
    lengthM: 58.3,
    diameterM: 3.81,
    launchMassT: 546,
    launchCost: null,
    totalLaunches: 100,
    successfulLaunches: 99,
    failedLaunches: 1,
    pendingLaunches: 5,
    attemptedLandings: 0,
    successfulLandings: 0,
    failedLandings: 0,
    familyName: 'Atlas',
    familyDescription: 'Family of American missiles and space launch vehicles.'
  },
  {
    id: 201,
    name: 'Vulcan Centaur',
    fullName: 'Vulcan Centaur',
    description: 'Vulcan Centaur is a two-stage-to-orbit heavy-lift launch vehicle under development by United Launch Alliance.',
    active: true,
    reusable: false,
    maidenFlight: '2024-01-08',
    manufacturerName: 'United Launch Alliance',
    manufacturerAbbrev: 'ULA',
    countryCode: 'US',
    countryName: 'United States of America',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/vulcan_centaur_image_20230807133459.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Vulcan_Centaur',
    infoUrl: 'https://www.ulalaunch.com/rockets/vulcan-centaur',
    leoCapacityKg: 27200,
    gtoCapacityKg: 14400,
    toThrustKN: 11060,
    lengthM: 61.6,
    diameterM: 5.4,
    launchMassT: 546,
    launchCost: null,
    totalLaunches: 2,
    successfulLaunches: 2,
    failedLaunches: 0,
    pendingLaunches: 10,
    attemptedLandings: 0,
    successfulLandings: 0,
    failedLandings: 0,
    familyName: 'Vulcan',
    familyDescription: 'Next-generation launch vehicle from United Launch Alliance.'
  }
]
