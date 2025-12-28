// src/lib/cache.js
// Local storage caching with TTL support

export function getWithTTL(key) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    const { data, timestamp, ttl } = JSON.parse(item)
    const now = Date.now()
    
    if (now - timestamp > ttl) {
      localStorage.removeItem(key)
      return null
    }
    
    return data
  } catch (e) {
    console.error('Cache read error:', e)
    return null
  }
}

export function setWithTTL(key, data, ttlMs = 12 * 60 * 60 * 1000) {
  try {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    }
    localStorage.setItem(key, JSON.stringify(item))
  } catch (e) {
    console.error('Cache write error:', e)
  }
}

export function clearCache(keyPrefix) {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(keyPrefix))
    keys.forEach(k => localStorage.removeItem(k))
  } catch (e) {
    console.error('Cache clear error:', e)
  }
}
