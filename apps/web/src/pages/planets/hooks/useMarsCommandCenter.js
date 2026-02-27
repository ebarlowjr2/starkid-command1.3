// src/pages/planets/hooks/useMarsCommandCenter.js
// Custom hook for Mars Command Center data management

import { useState, useEffect, useCallback } from 'react'
import { getPhotoOfDay, extractTelemetry, MARS_FACTS } from '@starkid/core'

export default function useMarsCommandCenter() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [photoOfDay, setPhotoOfDay] = useState(null)
  const [telemetry, setTelemetry] = useState(null)
  const [weather, setWeather] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Try Curiosity first, fall back to Perseverance
      let photo = await getPhotoOfDay('curiosity')
      
      if (!photo) {
        photo = await getPhotoOfDay('perseverance')
      }

      if (photo) {
        setPhotoOfDay(photo)
        setTelemetry(extractTelemetry(photo))
      } else {
        setError('No rover photos available')
      }

      // Weather: Mode A - No official live weather available
      // InSight lander was retired in Dec 2022
      const enableCommunityWeather = import.meta.env.VITE_ENABLE_COMMUNITY_MARS_WEATHER === 'true'
      
      if (enableCommunityWeather) {
        // Mode B: Community weather API (if enabled)
        // For now, we'll just set a placeholder - can integrate a community API later
        setWeather({
          available: false,
          source: 'community',
          message: 'Community weather API not configured'
        })
      } else {
        // Mode A: Default - no official weather
        setWeather({
          available: false,
          source: 'official',
          message: 'Live surface weather is not officially provided via a stable NASA public endpoint. InSight lander was retired in December 2022.'
        })
      }

    } catch (err) {
      console.error('Error loading Mars data:', err)
      setError(err.message || 'Failed to load Mars data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    loading,
    error,
    photoOfDay,
    telemetry,
    weather,
    facts: MARS_FACTS,
    refresh
  }
}
