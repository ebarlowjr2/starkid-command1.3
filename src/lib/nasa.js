const BASE = 'https://api.nasa.gov'
const KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

export async function getAPOD(){
  const r = await fetch(`${BASE}/planetary/apod?api_key=${KEY}`)
  if(!r.ok) throw new Error('APOD failed')
  return r.json()
}

export async function getNEOsToday(){
  // Use NeoWs feed for today and flatten close-approach data
  const today = new Date().toISOString().slice(0,10)
  const r = await fetch(`${BASE}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${KEY}`)
  if(!r.ok) throw new Error('NEO feed failed')
  const data = await r.json()
  const arr = []
  for (const k in data.near_earth_objects){
    for (const obj of data.near_earth_objects[k]){
      const ca = obj.close_approach_data?.[0]
      if(ca){
        arr.push({
          name: obj.name,
          close_approach_date_full: ca.close_approach_date_full || ca.close_approach_date,
          miss_distance_km: ca.miss_distance?.kilometers
        })
      }
    }
  }
  // sort by distance
  arr.sort((a,b)=> Number(a.miss_distance_km)-Number(b.miss_distance_km))
  return arr
}

export async function getDonkiAlerts(){
  // NASA DONKI notifications
  const r = await fetch(`${BASE}/DONKI/notifications?type=all&api_key=${KEY}`)
  if(!r.ok) throw new Error('DONKI failed')
  return r.json()
}
