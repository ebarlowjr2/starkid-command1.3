const BASE = 'https://api.spacexdata.com/v5'

export async function getLatestLaunch(){
  const r = await fetch(`${BASE}/launches/latest`)
  if(!r.ok) throw new Error('SpaceX latest failed')
  return r.json()
}
