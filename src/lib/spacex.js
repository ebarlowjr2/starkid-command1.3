const BASE = 'https://api.spacexdata.com/v5'

export async function getLatestLaunch(){
  const r = await fetch(`${BASE}/launches/latest`)
  if(!r.ok) throw new Error('SpaceX latest failed')
  return r.json()
}

export async function getUpcomingLaunches(limit = 5){
  const r = await fetch(`${BASE}/launches/upcoming`)
  if(!r.ok) throw new Error('SpaceX upcoming failed')
  const data = await r.json()
  data.sort((a,b)=> new Date(a.date_utc) - new Date(b.date_utc))
  return data.slice(0, limit)
}

export async function getRockets(){
  const r = await fetch(`https://api.spacexdata.com/v4/rockets`)
  if(!r.ok) throw new Error('SpaceX rockets failed')
  return r.json()
}

export async function getCrew(limit = 8){
  const r = await fetch(`https://api.spacexdata.com/v4/crew`)
  if(!r.ok) throw new Error('SpaceX crew failed')
  const data = await r.json()
  data.sort((a,b)=> a.name.localeCompare(b.name))
  return data.slice(0, limit)
}
