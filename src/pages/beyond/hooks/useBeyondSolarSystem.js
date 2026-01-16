// src/pages/beyond/hooks/useBeyondSolarSystem.js
// Custom hook for Beyond Our Solar System page data management

import { useState, useEffect, useCallback } from 'react'
import {
  getExoplanets,
  getDiscoveryStats,
  getHabitableCandidates,
  getDiscoveryMethods,
  getStarTypes,
  filterPlanets,
  paginatePlanets,
  DETECTION_METHODS
} from '../../../lib/exoplanets/exoplanetService.js'

export default function useBeyondSolarSystem() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [planets, setPlanets] = useState([])
  const [stats, setStats] = useState(null)
  const [habitableCandidates, setHabitableCandidates] = useState([])
  const [discoveryMethods, setDiscoveryMethods] = useState([])
  const [starTypes, setStarTypes] = useState([])

  // Filter state
  const [filters, setFilters] = useState({
    maxDistance: null,
    discoveryMethod: null,
    starType: null
  })

  // Pagination state
  const [page, setPage] = useState(1)
  const [perPage] = useState(15)

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getExoplanets()
      setPlanets(data)
      setStats(getDiscoveryStats(data))
      setHabitableCandidates(getHabitableCandidates(data))
      setDiscoveryMethods(getDiscoveryMethods(data))
      setStarTypes(getStarTypes(data))
    } catch (err) {
      console.error('Failed to load exoplanet data:', err)
      setError('Failed to load exoplanet data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Get filtered and paginated planets
  const getFilteredPlanets = useCallback(() => {
    const filtered = filterPlanets(planets, filters)
    return paginatePlanets(filtered, page, perPage)
  }, [planets, filters, page, perPage])

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPage(1) // Reset to first page when filters change
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      maxDistance: null,
      discoveryMethod: null,
      starType: null
    })
    setPage(1)
  }, [])

  // Refresh data
  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    loading,
    error,
    stats,
    habitableCandidates,
    discoveryMethods,
    starTypes,
    detectionMethods: DETECTION_METHODS,
    filteredPlanets: getFilteredPlanets(),
    filters,
    updateFilters,
    clearFilters,
    page,
    setPage,
    refresh
  }
}
