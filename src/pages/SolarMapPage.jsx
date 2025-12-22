/**
 * SolarMapPage - Interactive 3D Solar System Map (Orrery)
 * 
 * Features:
 * - 3D visualization of Sun + 8 planets
 * - Optional comet tracking via URL param
 * - Time controls (date/time picker, Now button)
 * - Orbit paths, labels, ecliptic plane toggles
 * - Shareable URL params: ?obj=...&date=YYYY-MM-DD&h=...&m=...
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrreryScene } from '../components/orrery/OrreryScene.jsx'
import { parseSolarMapParams, buildSolarMapSearch, toIsoUtc } from '../lib/solarMapUrl.js'
import { fetchVectors } from '../lib/horizonsClient.js'
import { auToVec3, AU_SCALE } from '../lib/solarScale.js'
import { sampleOrbit } from '../lib/orbitSampling.js'

const DEFAULT_TARGETS = [
  'SUN',
  'MERCURY',
  'VENUS',
  'EARTH',
  'MARS',
  'JUPITER',
  'SATURN',
  'URANUS',
  'NEPTUNE'
]

export default function SolarMapPage() {
  // Parse initial state from URL
  const initial = useMemo(() => parseSolarMapParams(window.location.search), [])
  
  // State
  const [obj, setObj] = useState(initial.obj)
  const [date, setDate] = useState(initial.date)
  const [h, setH] = useState(initial.h)
  const [m, setM] = useState(initial.m)
  
  const [showLabels, setShowLabels] = useState(true)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showPlane, setShowPlane] = useState(false)
  
  const [selected, setSelected] = useState(undefined)
  const [focusRequest, setFocusRequest] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [loadingOrbits, setLoadingOrbits] = useState(false)
  const [err, setErr] = useState(null)
  
  const [positions, setPositions] = useState({})
  const [orbitLines, setOrbitLines] = useState({})
  
  // Computed values
  const datetimeIso = useMemo(() => toIsoUtc(date, h, m), [date, h, m])
  
  const targets = useMemo(() => {
    const t = [...DEFAULT_TARGETS]
    if (obj && !t.includes(obj)) t.push(obj)
    return t
  }, [obj])
  
  // Keep URL synced with state
  useEffect(() => {
    const search = buildSolarMapSearch({ obj, date, h, m })
    const newUrl = `${window.location.pathname}${search}`
    window.history.replaceState({}, '', newUrl)
  }, [obj, date, h, m])
  
  // Fetch positions
  const refreshPositions = useCallback(async () => {
    setLoading(true)
    setErr(null)
    
    try {
      const vec = await fetchVectors(targets, datetimeIso)
      
      const nextPos = {}
      for (const [name, pAu] of Object.entries(vec.positions)) {
        nextPos[name] = auToVec3(pAu)
      }
      setPositions(nextPos)
      setLoading(false)
    } catch (e) {
      setLoading(false)
      setErr(e?.message || 'Failed to load solar map data')
    }
  }, [targets, datetimeIso])
  
  // Fetch orbit lines (separate from positions for performance)
  const refreshOrbits = useCallback(async () => {
    setLoadingOrbits(true)
    
    try {
      // Only sample orbits for inner planets + optional comet
      const orbitTargets = ['MERCURY', 'VENUS', 'EARTH', 'MARS']
      if (obj) orbitTargets.push(obj)
      
      const nextOrbits = {}
      for (const t of orbitTargets) {
        nextOrbits[t] = await sampleOrbit(t, datetimeIso)
      }
      setOrbitLines(nextOrbits)
    } catch (e) {
      console.warn('Failed to load orbit lines:', e.message)
    }
    
    setLoadingOrbits(false)
  }, [datetimeIso, obj])
  
  // Initial load
  useEffect(() => {
    refreshPositions()
  }, [refreshPositions])
  
  // Load orbits after positions (optional, can be slow)
  useEffect(() => {
    if (showOrbits && Object.keys(orbitLines).length === 0) {
      refreshOrbits()
    }
  }, [showOrbits, orbitLines, refreshOrbits])
  
  // Handle body selection
  const onSelect = useCallback((name) => {
    setSelected(name)
    const pos = positions[name]
    if (pos) {
      setFocusRequest({ target: pos.clone(), nonce: Date.now() })
    }
  }, [positions])
  
  // Set to current time
  const setNow = () => {
    const now = new Date()
    const yyyy = now.getUTCFullYear()
    const mm2 = String(now.getUTCMonth() + 1).padStart(2, '0')
    const dd2 = String(now.getUTCDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm2}-${dd2}`)
    setH(now.getUTCHours())
    setM(now.getUTCMinutes())
  }
  
  // Copy shareable URL
  const copyUrl = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy URL')
    })
  }
  
  return (
    <div className="h-full flex flex-col min-h-0 flex-1">
      {/* Header controls */}
      <div className="p-4 border-b border-cyan-800 bg-black/50">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold tracking-wider text-cyan-200">
              3D SOLAR MAP
            </h2>
            <p className="text-xs text-cyan-400 opacity-80">
              UTC: {date} {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
            </p>
          </div>
          
          {/* Time controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="text-cyan-400">
              Comet:
              <input
                type="text"
                value={obj || ''}
                placeholder="e.g. c2025n1"
                onChange={(e) => setObj(e.target.value.trim() || undefined)}
                className="ml-1 px-2 py-1 w-28 bg-black/60 border border-cyan-700 rounded text-cyan-200 placeholder-cyan-600"
              />
            </label>
            
            <label className="text-cyan-400">
              Date:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ml-1 px-2 py-1 bg-black/60 border border-cyan-700 rounded text-cyan-200"
              />
            </label>
            
            <label className="text-cyan-400">
              Hour:
              <input
                type="number"
                min="0"
                max="23"
                value={h}
                onChange={(e) => setH(Number(e.target.value) || 0)}
                className="ml-1 px-2 py-1 w-14 bg-black/60 border border-cyan-700 rounded text-cyan-200"
              />
            </label>
            
            <label className="text-cyan-400">
              Min:
              <input
                type="number"
                min="0"
                max="59"
                value={m}
                onChange={(e) => setM(Number(e.target.value) || 0)}
                className="ml-1 px-2 py-1 w-14 bg-black/60 border border-cyan-700 rounded text-cyan-200"
              />
            </label>
            
            <button
              onClick={setNow}
              className="px-3 py-1 bg-cyan-700/30 border border-cyan-600 rounded text-cyan-200 hover:bg-cyan-600/40 transition-colors"
            >
              Now
            </button>
            
            <button
              onClick={refreshPositions}
              disabled={loading}
              className="px-3 py-1 bg-cyan-700/30 border border-cyan-600 rounded text-cyan-200 hover:bg-cyan-600/40 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {/* View toggles */}
          <div className="flex flex-wrap items-center gap-3 text-xs lg:ml-auto">
            <label className="flex items-center gap-1 text-cyan-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="accent-cyan-500"
              />
              Labels
            </label>
            
            <label className="flex items-center gap-1 text-cyan-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
                className="accent-cyan-500"
              />
              Orbits
              {loadingOrbits && <span className="text-cyan-600">(loading...)</span>}
            </label>
            
            <label className="flex items-center gap-1 text-cyan-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showPlane}
                onChange={(e) => setShowPlane(e.target.checked)}
                className="accent-cyan-500"
              />
              Ecliptic
            </label>
            
            <button
              onClick={copyUrl}
              className="px-3 py-1 bg-cyan-700/30 border border-cyan-600 rounded text-cyan-200 hover:bg-cyan-600/40 transition-colors"
            >
              Share
            </button>
            
            <span className="text-cyan-600">
              Scale: 1 AU = {AU_SCALE}u
            </span>
          </div>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="flex-1 relative bg-black min-h-0">
        {/* Status overlays */}
        {loading && (
          <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-black/80 border border-cyan-700 rounded text-cyan-300 text-sm">
            Loading solar system data...
          </div>
        )}
        
        {err && (
          <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-red-900/80 border border-red-600 rounded text-red-200 text-sm">
            {err}
          </div>
        )}
        
        {selected && (
          <div className="absolute bottom-4 left-4 z-10 px-3 py-2 bg-black/80 border border-cyan-700 rounded text-cyan-300 text-sm">
            Selected: <span className="font-bold text-cyan-200">{selected}</span>
            {positions[selected] && (
              <span className="ml-2 text-cyan-500">
                (click elsewhere to deselect)
              </span>
            )}
          </div>
        )}
        
        {/* Instructions */}
        <div className="absolute bottom-4 right-4 z-10 px-3 py-2 bg-black/60 border border-cyan-800 rounded text-cyan-500 text-xs">
          Drag to rotate | Scroll to zoom | Click planet to focus
        </div>
        
        {/* Three.js Canvas */}
        <Canvas
          camera={{ position: [0, 22, 34], fov: 55, near: 0.1, far: 1000 }}
          dpr={[1, 2]}
          style={{ background: '#000000' }}
        >
          <OrreryScene
            positions={positions}
            orbitLines={orbitLines}
            showLabels={showLabels}
            showOrbits={showOrbits}
            showPlane={showPlane}
            selected={selected}
            onSelect={onSelect}
            focusRequest={focusRequest}
          />
        </Canvas>
      </div>
    </div>
  )
}
