import type { ServiceResult, SourceStatus } from './types'
import { getNEOsToday } from '../clients/nasa/nasa.js'
import { getWithTTL, setWithTTL } from '../storage/cache.js'

export async function getAsteroidFlybys(): Promise<ServiceResult<any[]>> {
  const sources: SourceStatus[] = []
  const warnings: string[] = []
  const cacheKey = 'starkid:cache:asteroids:today'
  const cached = await getWithTTL(cacheKey, true)

  let data: any[] = []
  try {
    data = await getNEOsToday()
    sources.push({ name: 'neo-feed', ok: true, count: data?.length || 0 })
  } catch (error: any) {
    sources.push({ name: 'neo-feed', ok: false, error: error?.message || 'failed' })
  }

  if (data?.length) {
    await setWithTTL(cacheKey, data, 6 * 60 * 60 * 1000)
    return { data, sources }
  }

  if (cached?.length) {
    sources.push({ name: 'cache', ok: true, count: cached.length })
    warnings.push('Using cached asteroid flybys')
    return { data: cached, sources, warnings }
  }

  warnings.push('Asteroid flybys unavailable')
  return { data: [], sources, warnings }
}
