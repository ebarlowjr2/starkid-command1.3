// src/lib/iss.js
// Position from wheretheiss.at (CORS OK) + crew via our own /api proxy (works on Vercel & via Vite dev proxy)

export async function getISSNow() {
    const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    if (!r.ok) throw new Error('ISS position failed');
    const d = await r.json();
    return {
      timestamp: new Date().toISOString(),
      latitude: d.latitude,
      longitude: d.longitude,
      altitude: d.altitude,
      velocity: d.velocity,
    };
  }
  
  export async function getAstros() {
    // same-origin call; in dev Vite proxies it, in prod Vercel serves it
    const r = await fetch('/api/astros');
    if (!r.ok) throw new Error('People in space failed');
    return r.json();
  }
  