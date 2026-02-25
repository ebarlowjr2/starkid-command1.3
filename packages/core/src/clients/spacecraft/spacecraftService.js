import { getWithTTL, setWithTTL } from '../../storage/cache.js'

const LL2_BASE_URL = 'https://ll.thespacedevs.com/2.3.0'
const SPACECRAFT_CACHE_KEY = 'spacecraft:configs:in_use:v1'
const SPACECRAFT_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const SPACECRAFT_DETAIL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function normalizeSpacecraft(raw) {
  const agency = raw.agency || {}
  
  return {
    id: raw.id,
    name: raw.name,
    typeName: raw.type?.name || 'Unknown',
    agencyName: agency.name || 'Unknown',
    agencyAbbrev: agency.abbrev || null,
    countryCode: agency.country?.[0]?.alpha_2_code || null,
    countryName: agency.country?.[0]?.name || null,
    description: raw.description || null,
    history: raw.history || null,
    imageUrl: raw.image?.image_url || raw.image?.thumbnail_url || null,
    thumbnailUrl: raw.image?.thumbnail_url || raw.image?.image_url || null,
    wikiUrl: raw.wiki_link || null,
    infoUrl: raw.info_link || null,
    humanRated: raw.human_rated ?? false,
    inUse: raw.in_use ?? true,
    maidenFlight: raw.maiden_flight || null,
    crewCapacity: raw.crew_capacity || null,
    flightLife: raw.flight_life || null,
    capability: raw.capability || null,
  }
}

export async function getActiveSpacecraft() {
  const cached = await getWithTTL(SPACECRAFT_CACHE_KEY)
  if (cached) {
    return { spacecraft: cached, fromCache: true }
  }

  try {
    const response = await fetch(
      `${LL2_BASE_URL}/spacecraft_configurations/?mode=detailed&in_use=true&limit=100`
    )
    
    if (!response.ok) {
      throw new Error(`LL2 API error: ${response.status}`)
    }
    
    const data = await response.json()
    let spacecraft = data.results.map(normalizeSpacecraft)
    
    if (data.next && data.count > spacecraft.length) {
      const response2 = await fetch(data.next)
      if (response2.ok) {
        const data2 = await response2.json()
        spacecraft = [...spacecraft, ...data2.results.map(normalizeSpacecraft)]
      }
    }
    
    spacecraft.sort((a, b) => a.name.localeCompare(b.name))
    
    await setWithTTL(SPACECRAFT_CACHE_KEY, spacecraft, SPACECRAFT_CACHE_TTL)
    
    return { spacecraft, fromCache: false }
  } catch (error) {
    console.error('Error fetching spacecraft:', error)
    const stale = await getWithTTL(SPACECRAFT_CACHE_KEY, true)
    if (stale) {
      return { spacecraft: stale, fromCache: true, stale: true }
    }
    return { spacecraft: SAMPLE_SPACECRAFT, fromCache: false, fallback: true }
  }
}

export async function getSpacecraftById(id) {
  const cacheKey = `spacecraft:config:${id}:v1`
  const cached = await getWithTTL(cacheKey)
  if (cached) {
    return { spacecraft: cached, fromCache: true }
  }

  try {
    const response = await fetch(
      `${LL2_BASE_URL}/spacecraft_configurations/${id}/?mode=detailed`
    )
    
    if (!response.ok) {
      throw new Error(`LL2 API error: ${response.status}`)
    }
    
    const data = await response.json()
    const spacecraft = normalizeSpacecraft(data)
    
    await setWithTTL(cacheKey, spacecraft, SPACECRAFT_DETAIL_CACHE_TTL)
    
    return { spacecraft, fromCache: false }
  } catch (error) {
    console.error('Error fetching spacecraft detail:', error)
    const { spacecraft: allSpacecraft } = await getActiveSpacecraft()
    const spacecraft = allSpacecraft.find(s => s.id === parseInt(id))
    if (spacecraft) {
      return { spacecraft, fromCache: true }
    }
    throw error
  }
}

export function filterSpacecraft(spacecraft, filters) {
  let filtered = [...spacecraft]
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.agencyName.toLowerCase().includes(search)
    )
  }
  
  if (filters.type) {
    filtered = filtered.filter(s => s.typeName === filters.type)
  }
  
  if (filters.humanRated === true) {
    filtered = filtered.filter(s => s.humanRated === true)
  }
  
  return filtered
}

export function sortSpacecraft(spacecraft, sortBy) {
  const sorted = [...spacecraft]
  
  switch (sortBy) {
    case 'agency':
      return sorted.sort((a, b) => a.agencyName.localeCompare(b.agencyName))
    case 'type':
      return sorted.sort((a, b) => a.typeName.localeCompare(b.typeName))
    case 'name':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
}

export function getUniqueTypes(spacecraft) {
  const types = new Set()
  spacecraft.forEach(s => {
    if (s.typeName && s.typeName !== 'Unknown') {
      types.add(s.typeName)
    }
  })
  return Array.from(types).sort()
}

export function getUniqueAgencies(spacecraft) {
  const agencies = new Set()
  spacecraft.forEach(s => {
    if (s.agencyName && s.agencyName !== 'Unknown') {
      agencies.add(s.agencyName)
    }
  })
  return Array.from(agencies).sort()
}

const SAMPLE_SPACECRAFT = [
  {
    id: 1,
    name: 'Dragon 2',
    typeName: 'Capsule',
    agencyName: 'SpaceX',
    agencyAbbrev: 'SpX',
    countryCode: 'US',
    countryName: 'United States of America',
    description: 'Dragon 2 is a class of reusable spacecraft developed and manufactured by SpaceX, designed to transport crew and cargo to the International Space Station.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/spacex_dragon_2_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/SpaceX_Dragon_2',
    infoUrl: 'https://www.spacex.com/vehicles/dragon/',
    humanRated: true,
    inUse: true,
    maidenFlight: '2019-03-02',
    crewCapacity: 7,
    flightLife: null,
    capability: 'Crew and cargo transport to ISS',
  },
  {
    id: 2,
    name: 'Crew Dragon',
    typeName: 'Capsule',
    agencyName: 'SpaceX',
    agencyAbbrev: 'SpX',
    countryCode: 'US',
    countryName: 'United States of America',
    description: 'Crew Dragon is a human-rated variant of the Dragon 2 spacecraft, capable of carrying up to 7 passengers to and from Earth orbit.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/crew_dragon_image_20200503184111.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/SpaceX_Dragon_2',
    infoUrl: 'https://www.spacex.com/vehicles/dragon/',
    humanRated: true,
    inUse: true,
    maidenFlight: '2020-05-30',
    crewCapacity: 7,
    flightLife: null,
    capability: 'Crew transport to ISS and private missions',
  },
  {
    id: 3,
    name: 'Cargo Dragon',
    typeName: 'Cargo Resupply',
    agencyName: 'SpaceX',
    agencyAbbrev: 'SpX',
    countryCode: 'US',
    countryName: 'United States of America',
    description: 'Cargo Dragon is an uncrewed variant of Dragon 2 used for cargo resupply missions to the International Space Station.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/cargo_dragon_image_20200503184111.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/SpaceX_Dragon_2',
    infoUrl: 'https://www.spacex.com/vehicles/dragon/',
    humanRated: false,
    inUse: true,
    maidenFlight: '2020-12-06',
    crewCapacity: null,
    flightLife: null,
    capability: 'Cargo transport to ISS',
  },
  {
    id: 4,
    name: 'Orion',
    typeName: 'Capsule',
    agencyName: 'NASA',
    agencyAbbrev: 'NASA',
    countryCode: 'US',
    countryName: 'United States of America',
    description: 'Orion is a class of partially reusable spacecraft used in NASA\'s Artemis program to send astronauts to the Moon and beyond.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/orion_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Orion_(spacecraft)',
    infoUrl: 'https://www.nasa.gov/exploration/systems/orion/index.html',
    humanRated: true,
    inUse: true,
    maidenFlight: '2014-12-05',
    crewCapacity: 4,
    flightLife: null,
    capability: 'Deep space exploration and lunar missions',
  },
  {
    id: 5,
    name: 'Soyuz MS',
    typeName: 'Capsule',
    agencyName: 'Roscosmos',
    agencyAbbrev: 'RFSA',
    countryCode: 'RU',
    countryName: 'Russian Federation',
    description: 'Soyuz MS is the latest modernized version of the Soyuz spacecraft, used for crew transport to the International Space Station.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/soyuz_ms_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Soyuz_MS',
    infoUrl: null,
    humanRated: true,
    inUse: true,
    maidenFlight: '2016-07-07',
    crewCapacity: 3,
    flightLife: null,
    capability: 'Crew transport to ISS',
  },
  {
    id: 6,
    name: 'Progress MS',
    typeName: 'Cargo Resupply',
    agencyName: 'Roscosmos',
    agencyAbbrev: 'RFSA',
    countryCode: 'RU',
    countryName: 'Russian Federation',
    description: 'Progress MS is an uncrewed cargo spacecraft used to resupply the International Space Station.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/progress_ms_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Progress_MS',
    infoUrl: null,
    humanRated: false,
    inUse: true,
    maidenFlight: '2015-12-21',
    crewCapacity: null,
    flightLife: null,
    capability: 'Cargo transport to ISS',
  },
  {
    id: 7,
    name: 'Starliner',
    typeName: 'Capsule',
    agencyName: 'Boeing',
    agencyAbbrev: 'BA',
    countryCode: 'US',
    countryName: 'United States of America',
    description: 'CST-100 Starliner is a crew capsule manufactured by Boeing as part of NASA\'s Commercial Crew Program.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/starliner_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Boeing_Starliner',
    infoUrl: 'https://www.boeing.com/space/starliner/',
    humanRated: true,
    inUse: true,
    maidenFlight: '2019-12-20',
    crewCapacity: 7,
    flightLife: null,
    capability: 'Crew transport to ISS',
  },
  {
    id: 8,
    name: 'Shenzhou',
    typeName: 'Capsule',
    agencyName: 'CNSA',
    agencyAbbrev: 'CNSA',
    countryCode: 'CN',
    countryName: 'China',
    description: 'Shenzhou is a spacecraft developed by China for its human spaceflight program, used to transport crew to the Tiangong space station.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/shenzhou_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Shenzhou_(spacecraft)',
    infoUrl: null,
    humanRated: true,
    inUse: true,
    maidenFlight: '1999-11-20',
    crewCapacity: 3,
    flightLife: null,
    capability: 'Crew transport to Tiangong space station',
  },
  {
    id: 9,
    name: 'Tianzhou',
    typeName: 'Cargo Resupply',
    agencyName: 'CNSA',
    agencyAbbrev: 'CNSA',
    countryCode: 'CN',
    countryName: 'China',
    description: 'Tianzhou is an automated cargo spacecraft used to resupply the Chinese space station Tiangong.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/tianzhou_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Tianzhou_(spacecraft)',
    infoUrl: null,
    humanRated: false,
    inUse: true,
    maidenFlight: '2017-04-20',
    crewCapacity: null,
    flightLife: null,
    capability: 'Cargo transport to Tiangong space station',
  },
  {
    id: 10,
    name: 'Dream Chaser',
    typeName: 'Spaceplane',
    agencyName: 'Sierra Space',
    agencyAbbrev: 'SNC',
    countryCode: 'US',
    countryName: 'United States of America',
    description: 'Dream Chaser is a reusable lifting-body spaceplane being developed by Sierra Space for cargo and crew transport.',
    imageUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/dream_chaser_image_20190222030839.jpeg',
    thumbnailUrl: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/255bauto255d__image_thumbnail_20240305193650.jpeg',
    wikiUrl: 'https://en.wikipedia.org/wiki/Dream_Chaser',
    infoUrl: 'https://www.sierraspace.com/dream-chaser/',
    humanRated: false,
    inUse: true,
    maidenFlight: null,
    crewCapacity: 7,
    flightLife: null,
    capability: 'Cargo and crew transport to ISS',
  },
]
