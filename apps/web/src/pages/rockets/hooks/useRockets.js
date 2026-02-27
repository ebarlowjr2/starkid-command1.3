import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  getActiveRockets, 
  filterRockets, 
  sortRockets, 
  getUniqueManufacturers 
} from '@starkid/core'

export default function useRockets() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rockets, setRockets] = useState([])
  const [fromCache, setFromCache] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    manufacturer: null,
    reusable: null
  })
  const [sortBy, setSortBy] = useState('name')

  const loadRockets = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getActiveRockets()
      setRockets(result.rockets)
      setFromCache(result.fromCache)
      
      if (result.fallback) {
        setError('Using sample data - API temporarily unavailable')
      }
    } catch (err) {
      console.error('Error loading rockets:', err)
      setError(err.message || 'Failed to load rockets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRockets()
  }, [loadRockets])

  const manufacturers = useMemo(() => {
    return getUniqueManufacturers(rockets)
  }, [rockets])

  const filteredRockets = useMemo(() => {
    const filtered = filterRockets(rockets, filters)
    return sortRockets(filtered, sortBy)
  }, [rockets, filters, sortBy])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      manufacturer: null,
      reusable: null
    })
  }, [])

  const refresh = useCallback(() => {
    loadRockets()
  }, [loadRockets])

  return {
    loading,
    error,
    rockets: filteredRockets,
    totalCount: rockets.length,
    filteredCount: filteredRockets.length,
    fromCache,
    filters,
    updateFilters,
    clearFilters,
    sortBy,
    setSortBy,
    manufacturers,
    refresh
  }
}
