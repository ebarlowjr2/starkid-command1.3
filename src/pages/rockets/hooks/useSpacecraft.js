import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  getActiveSpacecraft, 
  filterSpacecraft, 
  sortSpacecraft, 
  getUniqueTypes,
  getUniqueAgencies
} from '../../../lib/spacecraft/spacecraftService.js'

export default function useSpacecraft() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [spacecraft, setSpacecraft] = useState([])
  const [fromCache, setFromCache] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    type: null,
    humanRated: null
  })
  const [sortBy, setSortBy] = useState('name')

  const loadSpacecraft = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getActiveSpacecraft()
      setSpacecraft(result.spacecraft)
      setFromCache(result.fromCache)
      
      if (result.fallback) {
        setError('Using sample data - API temporarily unavailable')
      }
    } catch (err) {
      console.error('Error loading spacecraft:', err)
      setError(err.message || 'Failed to load spacecraft')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSpacecraft()
  }, [loadSpacecraft])

  const types = useMemo(() => {
    return getUniqueTypes(spacecraft)
  }, [spacecraft])

  const agencies = useMemo(() => {
    return getUniqueAgencies(spacecraft)
  }, [spacecraft])

  const filteredSpacecraft = useMemo(() => {
    const filtered = filterSpacecraft(spacecraft, filters)
    return sortSpacecraft(filtered, sortBy)
  }, [spacecraft, filters, sortBy])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      type: null,
      humanRated: null
    })
  }, [])

  const refresh = useCallback(() => {
    loadSpacecraft()
  }, [loadSpacecraft])

  return {
    loading,
    error,
    spacecraft: filteredSpacecraft,
    totalCount: spacecraft.length,
    filteredCount: filteredSpacecraft.length,
    fromCache,
    filters,
    updateFilters,
    clearFilters,
    sortBy,
    setSortBy,
    types,
    agencies,
    refresh
  }
}
