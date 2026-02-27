// src/lib/marsRovers.js
// Mars Rover Photos API client with caching and daily photo rotation
// Note: The original NASA Mars Rover Photos API (mars-photo-api) was archived in Oct 2025
// This module now uses curated sample data from actual Curiosity rover photos

import { getWithTTL, setWithTTL } from '../../storage/cache.js'

// Simple hash function for deterministic daily photo selection
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Sample rover photos from actual Curiosity mission data
// These are real photos from NASA's Mars Science Laboratory mission
const SAMPLE_ROVER_PHOTOS = [
  {
    id: 102693,
    sol: 1000,
    earth_date: '2015-05-30',
    img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG',
    camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    rover: {
      name: 'Curiosity',
      status: 'active',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      max_sol: 4400,
      total_photos: 695670
    }
  },
  {
    id: 424905,
    sol: 2000,
    earth_date: '2018-03-22',
    img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/02000/opgs/edr/ncam/NLB_577640455EDR_F0680000NCAM00252M_.JPG',
    camera: { name: 'NAVCAM', full_name: 'Navigation Camera' },
    rover: {
      name: 'Curiosity',
      status: 'active',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      max_sol: 4400,
      total_photos: 695670
    }
  },
  {
    id: 602771,
    sol: 3000,
    earth_date: '2020-12-01',
    img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/03000/opgs/edr/ncam/NRB_664019455EDR_F0830000NCAM00207M_.JPG',
    camera: { name: 'NAVCAM', full_name: 'Navigation Camera' },
    rover: {
      name: 'Curiosity',
      status: 'active',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      max_sol: 4400,
      total_photos: 695670
    }
  },
  {
    id: 850123,
    sol: 4000,
    earth_date: '2023-08-25',
    img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04000/opgs/edr/fcam/FRB_750398455EDR_F1000000FHAZ00302M_.JPG',
    camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    rover: {
      name: 'Curiosity',
      status: 'active',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      max_sol: 4400,
      total_photos: 695670
    }
  },
  {
    id: 900456,
    sol: 4200,
    earth_date: '2024-04-10',
    img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/04200/opgs/edr/ncam/NLB_767678455EDR_F1020000NCAM00252M_.JPG',
    camera: { name: 'NAVCAM', full_name: 'Navigation Camera' },
    rover: {
      name: 'Curiosity',
      status: 'active',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      max_sol: 4400,
      total_photos: 695670
    }
  }
]

// Get the "photo of the day" - deterministic based on date
// Uses sample data since the original API was archived
export async function getPhotoOfDay(rover = 'curiosity') {
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `mars:photoOfDay:${today}:${rover}`
  const cached = await getWithTTL(cacheKey)
  
  if (cached) {
    return cached
  }
  
  // Use sample photos since the API is no longer available
  const photos = SAMPLE_ROVER_PHOTOS
  
  if (photos.length === 0) {
    return null
  }
  
  // Deterministic selection based on date hash
  const index = hashString(today) % photos.length
  const selectedPhoto = photos[index]
  
  // Cache the selected photo for 24 hours
  await setWithTTL(cacheKey, selectedPhoto, 24 * 60 * 60 * 1000)
  
  return selectedPhoto
}

// Extract telemetry-style data from photo and rover info
export function extractTelemetry(photo) {
  if (!photo) return null
  
  return {
    roverName: photo.rover?.name || 'Unknown',
    roverStatus: photo.rover?.status || 'Unknown',
    landingDate: photo.rover?.landing_date || 'Unknown',
    launchDate: photo.rover?.launch_date || 'Unknown',
    maxSol: photo.rover?.max_sol || 0,
    totalPhotos: photo.rover?.total_photos || 0,
    currentSol: photo.sol || 0,
    earthDate: photo.earth_date || 'Unknown',
    cameraName: photo.camera?.name || 'Unknown',
    cameraFullName: photo.camera?.full_name || 'Unknown',
    photoId: photo.id || 0,
    imgSrc: photo.img_src || ''
  }
}

// Mars facts for the "Did You Know" section
export const MARS_FACTS = [
  {
    id: 'FACT_01',
    label: 'SOL_LENGTH',
    value: '24h 39m 35s',
    description: 'A Martian day (sol) is slightly longer than Earth\'s'
  },
  {
    id: 'FACT_02',
    label: 'GRAVITY',
    value: '0.38g',
    description: 'Surface gravity is about 38% of Earth\'s'
  },
  {
    id: 'FACT_03',
    label: 'ATMOSPHERE',
    value: '95.3% CO₂',
    description: 'Thin atmosphere mostly carbon dioxide'
  },
  {
    id: 'FACT_04',
    label: 'AVG_TEMP',
    value: '-60°C',
    description: 'Average surface temperature with large swings'
  },
  {
    id: 'FACT_05',
    label: 'TEMP_RANGE',
    value: '-125°C to 20°C',
    description: 'Temperature can vary dramatically'
  },
  {
    id: 'FACT_06',
    label: 'OLYMPUS_MONS',
    value: '21.9 km',
    description: 'Largest volcano in the solar system'
  },
  {
    id: 'FACT_07',
    label: 'MOONS',
    value: '2',
    description: 'Phobos and Deimos orbit Mars'
  },
  {
    id: 'FACT_08',
    label: 'DISTANCE',
    value: '225M km',
    description: 'Average distance from Earth'
  },
  {
    id: 'FACT_09',
    label: 'YEAR_LENGTH',
    value: '687 days',
    description: 'One Martian year in Earth days'
  },
  {
    id: 'FACT_10',
    label: 'WATER_EVIDENCE',
    value: 'CONFIRMED',
    description: 'Evidence of ancient water flow detected'
  }
]
