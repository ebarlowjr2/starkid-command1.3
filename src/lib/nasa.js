// src/lib/nasa.js
// NASA helpers: APOD, NeoWs, DONKI alerts, EPIC Earth, Solar Activity
const BASE = 'https://api.nasa.gov'
const KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

// === APOD ===
export async function getAPOD() {
  const r = await fetch(`${BASE}/planetary/apod?api_key=${KEY}`)
  if (!r.ok) throw new Error('APOD failed')
  return r.json()
}

// === NeoWs: near-Earth objects for today ===
export async function getNEOsToday() {
  const today = new Date().toISOString().slice(0, 10)
  const r = await fetch(`${BASE}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${KEY}`)
  if (!r.ok) throw new Error('NEO feed failed')
  const data = await r.json()
  const arr = []
  for (const k in data.near_earth_objects) {
    for (const obj of data.near_earth_objects[k]) {
      const ca = obj.close_approach_data?.[0]
      if (ca) {
        arr.push({
          name: obj.name,
          close_approach_date_full: ca.close_approach_date_full || ca.close_approach_date,
          miss_distance_km: ca.miss_distance?.kilometers
        })
      }
    }
  }
  arr.sort((a, b) => Number(a.miss_distance_km) - Number(b.miss_distance_km))
  return arr
}

// === DONKI notifications (alerts feed) ===
export async function getDonkiAlerts() {
  const r = await fetch(`${BASE}/DONKI/notifications?type=all&api_key=${KEY}`)
  if (!r.ok) throw new Error('DONKI failed')
  return r.json()
}

// === EPIC: Today’s Earth view ===
export async function getEPICLatest() {
  const r = await fetch(`${BASE}/EPIC/api/natural?api_key=${KEY}`)
  if (!r.ok) throw new Error('EPIC failed')
  const arr = await r.json()
  if (!arr.length) return null
  const latest = arr[arr.length - 1]
  const d = new Date(latest.date)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${yyyy}/${mm}/${dd}/png/${latest.image}.png`
  return { ...latest, imageUrl }
}

// === DONKI summary: recent solar activity (flares + CMEs) ===
export async function getRecentSolarActivity(days = 3) {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 3600 * 1000)
  const fmt = (d) => d.toISOString().slice(0, 10)

  const [flrResp, cmeResp] = await Promise.all([
    fetch(`${BASE}/DONKI/FLR?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${KEY}`),
    fetch(`${BASE}/DONKI/CME?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${KEY}`)
  ])
  if (!flrResp.ok) throw new Error('DONKI flares failed')
  if (!cmeResp.ok) throw new Error('DONKI CMEs failed')

  const flares = await flrResp.json()
  const cmes = await cmeResp.json()

  const scaleOrder = ['A', 'B', 'C', 'M', 'X']
  let strongest = null
  const counts = { A: 0, B: 0, C: 0, M: 0, X: 0 }
  for (const f of flares) {
    const cls = (f.classType || '').trim().toUpperCase() // e.g., "M2.7"
    const letter = cls[0]
    if (counts.hasOwnProperty(letter)) counts[letter]++
    if (letter && scaleOrder.includes(letter)) {
      if (!strongest || scaleOrder.indexOf(letter) > scaleOrder.indexOf(strongest)) strongest = letter
    }
  }
  const severityIdx = strongest ? scaleOrder.indexOf(strongest) : 0
  const severityPct = Math.round((severityIdx / (scaleOrder.length - 1)) * 100)

  return {
    flaresCount: flares.length,
    cmeCount: cmes.length,
    strongestClass: strongest || 'None',
    counts,
    severityPct
  }
}
