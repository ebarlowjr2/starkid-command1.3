import type { ServiceResult, SourceStatus } from './types'
import { getRecentSolarActivity } from '../clients/nasa/nasa.js'
import type { SolarActivity } from '@starkid/types'
import { getWithTTL, setWithTTL } from '../storage/cache.js'

type SolarOverrides = {
  activity?: SolarActivity | null
}

export async function getSolarActivity({
  days = 3,
  sourcesOverride,
}: {
  days?: number
  sourcesOverride?: SolarOverrides
} = {}): Promise<ServiceResult<SolarActivity | null>> {
  const sources: SourceStatus[] = []
  const warnings: string[] = []
  const cacheKey = `starkid:cache:solar:${days}`
  const cached = await getWithTTL(cacheKey, true)

  let activity: SolarActivity | null = null

  if (sourcesOverride?.activity !== undefined) {
    activity = sourcesOverride.activity
    sources.push({ name: 'donki', ok: true, count: activity ? 1 : 0 })
  } else {
    try {
      activity = await getRecentSolarActivity(days)
      sources.push({ name: 'donki', ok: true, count: activity ? 1 : 0 })
    } catch (error: any) {
      sources.push({ name: 'donki', ok: false, error: error?.message || 'failed' })
    }
  }

  if (!activity && sources.every((source) => !source.ok)) {
    warnings.push('Solar activity source failed')
  }

  if (activity) {
    await setWithTTL(cacheKey, activity, 30 * 60 * 1000)
  } else if (cached) {
    sources.push({ name: 'cache', ok: true, count: 1 })
    return { data: cached, sources, warnings: ['Using cached solar activity'] }
  }

  return { data: activity, sources, warnings: warnings.length ? warnings : undefined }
}
