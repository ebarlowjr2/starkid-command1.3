// src/lib/cache.js
// Shared storage caching with TTL support
import { getItem, setItem, removeItem, getAllKeys } from './storage.ts'

export async function getWithTTL(key, allowExpired = false) {
  try {
    const item = await getItem(key)
    if (!item) return null

    const { data, timestamp, ttl } = JSON.parse(item)
    const now = Date.now()

    if (!allowExpired && now - timestamp > ttl) {
      await removeItem(key)
      return null
    }

    return data
  } catch (e) {
    console.error('Cache read error:', e)
    return null
  }
}

export async function setWithTTL(key, data, ttlMs = 12 * 60 * 60 * 1000) {
  try {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    }
    await setItem(key, JSON.stringify(item))
  } catch (e) {
    console.error('Cache write error:', e)
  }
}

export async function clearCache(keyPrefix) {
  try {
    const keys = (await getAllKeys()).filter(k => k.startsWith(keyPrefix))
    await Promise.all(keys.map(k => removeItem(k)))
  } catch (e) {
    console.error('Cache clear error:', e)
  }
}
