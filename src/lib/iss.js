// src/lib/iss.js
// Position from wheretheiss.at (CORS OK), crew via our own /api proxy
export async function getISSNow(){
    const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
    if(!r.ok) throw new Error('ISS position failed')
    const d = await r.json()
    return {
      timestamp: new Date().toISOString(),
      latitude: d.latitude,
      longitude: d.longitude,
      altitude: d.altitude,
      velocity: d.velocity
    }
  }
  
  export async function getAstros(){
    // Call our local/production proxy (see steps 2 & 3)
    const r = await fetch('/api/astros')
    if(!r.ok) throw new Error('People in space failed')
    return r.json()
  }
  