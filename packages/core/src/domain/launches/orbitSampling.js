/**
 * Orbit path sampling utilities
 * Generates orbit lines by sampling positions over time
 */
import { fetchVectors } from '../../clients/horizons/horizonsClient.js'
import { auToVec3 } from './solarScale.js'

// Reduced sample count for MVP (balance between smoothness and API calls)
export const ORBIT_SAMPLES = 32
export const ORBIT_SPAN_DAYS = 365

/**
 * Sample orbit positions for a single target over a time span
 * @param {string} target - Target name (e.g., 'EARTH', 'MARS')
 * @param {string} centerIso - Center datetime in ISO format
 * @returns {Promise<THREE.Vector3[]>} Array of position vectors
 */
export async function sampleOrbit(target, centerIso) {
  const center = new Date(centerIso)
  const half = ORBIT_SPAN_DAYS / 2
  
  const points = []
  
  for (let i = 0; i < ORBIT_SAMPLES; i++) {
    const t = (i / (ORBIT_SAMPLES - 1)) * ORBIT_SPAN_DAYS - half
    const dt = new Date(center.getTime() + t * 24 * 3600 * 1000)
    const iso = dt.toISOString()
    
    try {
      const vec = await fetchVectors([target], iso)
      const pAu = vec.positions[target]
      if (pAu) {
        points.push(auToVec3(pAu))
      }
    } catch (err) {
      console.warn(`Failed to sample orbit for ${target} at ${iso}:`, err.message)
    }
  }
  
  return points
}

/**
 * Sample orbits for multiple targets in parallel batches
 * @param {string[]} targets - Array of target names
 * @param {string} centerIso - Center datetime in ISO format
 * @returns {Promise<Record<string, THREE.Vector3[]>>} Map of target to orbit points
 */
export async function sampleOrbits(targets, centerIso) {
  const orbits = {}
  
  // Process targets sequentially to avoid overwhelming the API
  for (const target of targets) {
    try {
      orbits[target] = await sampleOrbit(target, centerIso)
    } catch (err) {
      console.warn(`Failed to sample orbit for ${target}:`, err.message)
      orbits[target] = []
    }
  }
  
  return orbits
}
