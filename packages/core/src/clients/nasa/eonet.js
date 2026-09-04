const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3'

// EONET returns NASA-curated, open natural-event metadata in GeoJSON format.
export async function getOpenEarthEvents({ limit = 24, days = 14 } = {}) {
  const url = new URL(`${EONET_BASE_URL}/events/geojson`)
  url.searchParams.set('status', 'open')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('days', String(days))

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`EONET error: ${response.status}`)

  const payload = await response.json()
  return Array.isArray(payload?.features) ? payload.features : []
}
