import type { ServiceResult, SourceStatus } from './types'
import { getRockets } from '../clients/spacex/spacex.js'
import { getWithTTL, setWithTTL } from '../storage/cache.js'

export async function getRocketsService(): Promise<ServiceResult<any[]>> {
  const sources: SourceStatus[] = []
  const warnings: string[] = []
  const cacheKey = 'starkid:cache:rockets'
  const cached = await getWithTTL(cacheKey, true)

  let data: any[] = []
  try {
    data = await getRockets()
    sources.push({ name: 'spacex', ok: true, count: data?.length || 0 })
  } catch (error: any) {
    sources.push({ name: 'spacex', ok: false, error: error?.message || 'failed' })
  }

  if (data?.length) {
    await setWithTTL(cacheKey, data, 24 * 60 * 60 * 1000)
    return { data, sources }
  }

  if (cached?.length) {
    sources.push({ name: 'cache', ok: true, count: cached.length })
    warnings.push('Using cached rockets')
    return { data: cached, sources, warnings }
  }

  warnings.push('Rockets unavailable')
  return { data: [], sources, warnings }
}
