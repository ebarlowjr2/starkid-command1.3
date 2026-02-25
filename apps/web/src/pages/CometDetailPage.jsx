import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSavedComet, toggleSavedComet, setNotify } from '@starkid/core'
import { getCometByDesignation } from '@starkid/core'

export default function CometDetailPage() {
  const { designation } = useParams()
  const decodedDesignation = decodeURIComponent(designation)
  
  const [comet, setComet] = useState(null)
  const [savedData, setSavedData] = useState(null)
  const [visibility, setVisibility] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    loadCometData()
  }, [decodedDesignation])

  async function loadCometData() {
    const cometDetails = getCometByDesignation(decodedDesignation)
    setComet(cometDetails || { designation: decodedDesignation, name: decodedDesignation })
    
    const saved = await getSavedComet(decodedDesignation)
    setSavedData(saved)
  }

  async function handleToggleSave() {
    const newState = await toggleSavedComet(decodedDesignation, comet?.name || '')
    if (newState) {
      const saved = await getSavedComet(decodedDesignation)
      setSavedData(saved)
    } else {
      setSavedData(null)
    }
  }

  async function handleToggleNotify() {
    if (!savedData) return
    await setNotify(decodedDesignation, !savedData.notify)
    const saved = await getSavedComet(decodedDesignation)
    setSavedData(saved)
  }

  async function fetchVisibility() {
    setLoading(true)
    setError(null)
    setLocationError(null)
    setVisibility(null)

    try {
      // Get user's location
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'))
          return
        }
        
        navigator.geolocation.getCurrentPosition(resolve, (err) => {
          if (err.code === 1) {
            reject(new Error('Location permission denied. Please enable location access to check visibility.'))
          } else if (err.code === 2) {
            reject(new Error('Unable to determine your location. Please try again.'))
          } else {
            reject(new Error('Location request timed out. Please try again.'))
          }
        }, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Calculate date range (today and tomorrow)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const formatDate = (d) => d.toISOString().split('T')[0]

      // Call the Horizons proxy
      const response = await fetch('/api/horizons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          designation: decodedDesignation,
          lat: latitude,
          lon: longitude,
          elevation: 0,
          start: formatDate(today),
          stop: formatDate(tomorrow)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch visibility data (${response.status})`)
      }

      const data = await response.json()
      setVisibility({
        ...data,
        userLat: latitude,
        userLon: longitude,
        fetchedAt: new Date().toISOString()
      })

    } catch (err) {
      if (err.message.includes('Location') || err.message.includes('permission')) {
        setLocationError(err.message)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function getDirectionLabel(az) {
    if (az >= 337.5 || az < 22.5) return 'N'
    if (az >= 22.5 && az < 67.5) return 'NE'
    if (az >= 67.5 && az < 112.5) return 'E'
    if (az >= 112.5 && az < 157.5) return 'SE'
    if (az >= 157.5 && az < 202.5) return 'S'
    if (az >= 202.5 && az < 247.5) return 'SW'
    if (az >= 247.5 && az < 292.5) return 'W'
    if (az >= 292.5 && az < 337.5) return 'NW'
    return ''
  }

  if (!comet) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-cyan-900/30 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-cyan-900/20 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Back link */}
      <Link 
        to="/comets" 
        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm mb-4 transition-colors"
      >
        ← Back to Comets
      </Link>

      {/* Header */}
      <div className="border-2 border-cyan-600 rounded-lg p-6 bg-zinc-900/50 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-cyan-200">{comet.name}</h1>
            <p className="text-cyan-400">{comet.designation}</p>
          </div>
          <button
            onClick={handleToggleSave}
            className={`text-2xl transition-colors ${
              savedData 
                ? 'text-yellow-400 hover:text-yellow-300' 
                : 'text-cyan-600 hover:text-yellow-400'
            }`}
            title={savedData ? 'Remove from saved' : 'Save comet'}
          >
            {savedData ? '★' : '☆'}
          </button>
        </div>

        {comet.description && (
          <p className="text-cyan-200/70 text-sm mb-4">{comet.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {comet.period && (
            <div>
              <span className="text-cyan-400 text-xs block">Orbital Period</span>
              <span className="text-cyan-200">{comet.period}</span>
            </div>
          )}
          {comet.lastPerihelion && (
            <div>
              <span className="text-cyan-400 text-xs block">Last Perihelion</span>
              <span className="text-cyan-200">{comet.lastPerihelion}</span>
            </div>
          )}
          {comet.nextPerihelion && (
            <div>
              <span className="text-cyan-400 text-xs block">Next Perihelion</span>
              <span className="text-cyan-200">{comet.nextPerihelion}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notify Toggle (only if saved) */}
      {savedData && (
        <div className="border border-cyan-700 rounded-lg p-4 bg-zinc-900/50 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-cyan-200 font-semibold">Notifications</h3>
              <p className="text-cyan-400/60 text-xs">Get notified about this comet (coming soon)</p>
            </div>
            <button
              onClick={handleToggleNotify}
              className={`px-4 py-2 rounded border transition-all ${
                savedData.notify
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                  : 'bg-black/40 border-cyan-600 text-cyan-400 hover:border-cyan-500'
              }`}
            >
              {savedData.notify ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      )}

      {/* Visibility Section */}
      <div className="border border-cyan-700 rounded-lg p-4 bg-zinc-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cyan-300">Current Visibility</h3>
          <button
            onClick={fetchVisibility}
            disabled={loading}
            className={`px-4 py-2 rounded border transition-all ${
              loading
                ? 'bg-cyan-900/30 border-cyan-700 text-cyan-500 cursor-wait'
                : 'bg-cyan-500/20 border-cyan-500 text-cyan-200 hover:bg-cyan-500/30'
            }`}
          >
            {loading ? 'Loading...' : visibility ? 'Refresh' : 'Get Current Position'}
          </button>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4">
            <p className="text-yellow-200 text-sm">{locationError}</p>
            <p className="text-yellow-300/60 text-xs mt-1">
              Enable location access in your browser settings to check visibility.
            </p>
          </div>
        )}

        {/* API Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
            <p className="text-red-300/60 text-xs mt-1">
              This comet may not be in the JPL Horizons database, or there was a connection issue.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-cyan-900/30 rounded w-1/2"></div>
            <div className="h-4 bg-cyan-900/20 rounded w-2/3"></div>
            <div className="h-4 bg-cyan-900/20 rounded w-1/3"></div>
          </div>
        )}

        {/* Visibility Data */}
        {visibility && !loading && (
          <div className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 rounded p-3">
                <span className="text-cyan-400 text-xs block mb-1">Altitude</span>
                <span className={`text-lg font-mono ${
                  visibility.alt > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {visibility.alt?.toFixed(1)}°
                </span>
                <span className="text-cyan-500 text-xs block">
                  {visibility.alt > 0 ? 'Above horizon' : 'Below horizon'}
                </span>
              </div>
              
              <div className="bg-black/30 rounded p-3">
                <span className="text-cyan-400 text-xs block mb-1">Azimuth</span>
                <span className="text-lg font-mono text-cyan-200">
                  {visibility.az?.toFixed(1)}°
                </span>
                <span className="text-cyan-500 text-xs block">
                  {getDirectionLabel(visibility.az)}
                </span>
              </div>

              <div className="bg-black/30 rounded p-3">
                <span className="text-cyan-400 text-xs block mb-1">RA</span>
                <span className="text-sm font-mono text-cyan-200">
                  {visibility.ra}
                </span>
              </div>

              <div className="bg-black/30 rounded p-3">
                <span className="text-cyan-400 text-xs block mb-1">Dec</span>
                <span className="text-sm font-mono text-cyan-200">
                  {visibility.dec}
                </span>
              </div>
            </div>

            {/* Best Viewing Window */}
            {visibility.bestWindow && (
              <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4">
                <h4 className="text-cyan-300 font-semibold mb-2">Best Viewing Window</h4>
                <p className="text-cyan-200 text-sm mb-2">
                  {visibility.bestWindow.note}
                </p>
                <div className="text-cyan-400/70 text-xs">
                  <span>Peak altitude: {visibility.bestWindow.peakAlt?.toFixed(1)}°</span>
                  <span className="mx-2">•</span>
                  <span>Direction: {getDirectionLabel(visibility.bestWindow.peakAz)}</span>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-cyan-500/60 text-xs text-right">
              Last updated: {new Date(visibility.fetchedAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!visibility && !loading && !error && !locationError && (
          <div className="text-center py-6 text-cyan-400/60">
            <p className="text-sm">Click "Get Current Position" to check visibility from your location</p>
            <p className="text-xs mt-1 text-cyan-500/40">
              Requires location permission
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
