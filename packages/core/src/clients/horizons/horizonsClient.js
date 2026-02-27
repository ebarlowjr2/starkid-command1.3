/**
 * Client for fetching vector positions from the Horizons proxy API
 */

/**
 * Fetch heliocentric vector positions for multiple targets
 * @param {string[]} targets - Array of target names (e.g., ['EARTH', 'MARS', 'c2025n1'])
 * @param {string} datetimeIso - ISO datetime string
 * @returns {Promise<{datetime: string, units: string, frame: string, positions: Record<string, {x: number, y: number, z: number}>}>}
 */
export async function fetchVectors(targets, datetimeIso) {
  const response = await fetch('/api/horizons?mode=vectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targets, datetime: datetimeIso })
  })
  
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `API error: ${response.status}`)
  }
  
  return response.json()
}
