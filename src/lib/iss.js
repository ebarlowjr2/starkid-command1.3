// src/lib/iss.js
// Open Notify (ISS) helpers — no API key required
const OPEN = 'https://api.open-notify.org'

export async function getISSNow() {
  const r = await fetch(`${OPEN}/iss-now.json`)
  if (!r.ok) throw new Error('ISS position failed')
  const data = await r.json()
  const { latitude, longitude } = data.iss_position || {}
  return {
    timestamp: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : null,
    latitude: Number(latitude),
    longitude: Number(longitude)
  }
}

export async function getAstros() {
  const r = await fetch(`${OPEN}/astros.json`)
  if (!r.ok) throw new Error('People in space failed')
  const data = await r.json()
  const issCrew = (data.people || []).filter(p => (p.craft || '').toUpperCase().includes('ISS'))
  return { total: data.number, iss: issCrew }
}
