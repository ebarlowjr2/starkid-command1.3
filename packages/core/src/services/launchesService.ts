import type { Launch } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { getUpcomingLaunchesFromLibrary } from '../domain/launches/launchLibrary.js'
import { getUpcomingLaunches as getUpcomingSpaceXLaunches } from '../clients/spacex/spacex.js'
import { getLatestLaunch as getLatestSpaceXLaunch } from '../clients/spacex/spacex.js'
import { getWithTTL, setWithTTL } from '../storage/cache.js'
import type { Alert } from '@starkid/types'

type LaunchSourceOverrides = {
  launchLibrary?: Launch[]
  spaceX?: any[]
}

export async function getUpcomingLaunches({
  limit = 10,
  sourcesOverride,
}: {
  limit?: number
  sourcesOverride?: LaunchSourceOverrides
} = {}): Promise<ServiceResult<Launch[]>> {
  const sources: SourceStatus[] = []
  const warnings: string[] = []
  const cacheKey = `starkid:cache:launches:upcoming:${limit}`
  const cached = await getWithTTL(cacheKey, true)

  let launchLibraryData: any[] = []
  let spaceXData: any[] = []

  if (sourcesOverride?.launchLibrary) {
    launchLibraryData = sourcesOverride.launchLibrary
    sources.push({ name: 'launch-library', ok: true, count: launchLibraryData.length })
  } else {
    try {
      launchLibraryData = await getUpcomingLaunchesFromLibrary(limit)
      sources.push({ name: 'launch-library', ok: true, count: launchLibraryData.length })
    } catch (error: any) {
      sources.push({ name: 'launch-library', ok: false, error: error?.message || 'failed' })
    }
  }

  if (sourcesOverride?.spaceX) {
    spaceXData = sourcesOverride.spaceX
    sources.push({ name: 'spacex', ok: true, count: spaceXData.length })
  } else {
    try {
      const data = await getUpcomingSpaceXLaunches(limit)
      spaceXData = Array.isArray(data) ? data : []
      sources.push({ name: 'spacex', ok: true, count: spaceXData.length })
    } catch (error: any) {
      sources.push({ name: 'spacex', ok: false, error: error?.message || 'failed' })
    }
  }

  const normalized = normalizeLaunches(launchLibraryData, spaceXData)

  if (normalized.length) {
    await setWithTTL(cacheKey, normalized, 30 * 60 * 1000)
  } else if (cached?.length) {
    warnings.push('Using cached launch data')
    sources.push({ name: 'cache', ok: true, count: cached.length })
    return { data: cached, sources, warnings }
  }

  if (!normalized.length && sources.every((source) => !source.ok)) {
    warnings.push('All launch sources failed')
  }

  return { data: normalized, sources, warnings: warnings.length ? warnings : undefined }
}

export async function getLatestLaunch(): Promise<ServiceResult<Launch | null>> {
  const sources: SourceStatus[] = []
  let latest: any = null
  const cacheKey = 'starkid:cache:launches:latest'
  const cached = await getWithTTL(cacheKey, true)

  try {
    latest = await getLatestSpaceXLaunch()
    sources.push({ name: 'spacex', ok: true, count: latest ? 1 : 0 })
  } catch (error: any) {
    sources.push({ name: 'spacex', ok: false, error: error?.message || 'failed' })
  }

  const data = latest ? normalizeLaunch(latest, 'spacex') : null
  if (data) {
    await setWithTTL(cacheKey, data, 30 * 60 * 1000)
  } else if (cached) {
    sources.push({ name: 'cache', ok: true, count: 1 })
    return { data: cached, sources, warnings: ['Using cached latest launch'] }
  }
  return { data, sources, warnings: data ? undefined : ['Latest launch unavailable'] }
}

export async function getLaunchAlerts(): Promise<ServiceResult<Alert[]>> {
  const result = await getUpcomingLaunches({ limit: 25 })
  const alerts: Alert[] = (result.data || []).map((launch) => {
    const startTime = launch.net || launch.window_start || null
    return {
      id: `launch:${launch.id || launch.name || 'unknown'}`,
      type: 'launch',
      category: 'launch',
      title: launch.name || 'Upcoming Launch',
      description: launch.providerName ? `${launch.providerName} launch` : 'Upcoming launch window',
      severity: 'medium',
      priority: 2,
      startTime,
      missionAvailable: true,
      providerName: launch.providerName,
      providerType: launch.providerType,
      payload: launch,
    }
  })

  return {
    data: alerts,
    sources: result.sources,
    warnings: result.warnings,
  }
}

export async function getPriorityLaunches(): Promise<ServiceResult<Launch[]>> {
  const result = await getUpcomingLaunches({ limit: 15 })
  const now = Date.now()
  const horizon = now + 7 * 24 * 60 * 60 * 1000
  const filtered = (result.data || []).filter((launch) => {
    const time = getLaunchTime(launch)
    return time !== Number.POSITIVE_INFINITY && time <= horizon
  })
  return { data: filtered, sources: result.sources, warnings: result.warnings }
}

export function normalizeLaunches(launchLibraryData: any[], spaceXData: any[]): Launch[] {
  const items: Launch[] = []
  const seen = new Set<string>()

  const all = [
    ...(launchLibraryData || []).map((item) => ({ item, source: 'launch-library' })),
    ...(spaceXData || []).map((item) => ({ item, source: 'spacex' })),
  ]

  for (const entry of all) {
    const launch = normalizeLaunch(entry.item, entry.source)
    const key = makeLaunchKey(launch)
    if (seen.has(key)) continue
    seen.add(key)
    items.push(launch)
  }

  items.sort((a, b) => {
    const aTime = getLaunchTime(a)
    const bTime = getLaunchTime(b)
    if (aTime !== bTime) return aTime - bTime
    return String(a.name || '').localeCompare(String(b.name || ''))
  })

  return items
}

function normalizeLaunch(raw: any, source: string): Launch {
  const providerName = raw?.launch_service_provider?.name || raw?.provider?.name || raw?.provider || raw?.operator || undefined
  const providerType = inferProviderType(providerName || (source === 'spacex' ? 'SpaceX' : 'Other'))
  if (source === 'spacex') {
    return {
      id: raw.id,
      name: raw.name,
      net: raw.date_utc,
      window_start: raw.date_utc,
      providerName: providerName || 'SpaceX',
      providerType,
      rocketId: raw.rocket,
      pad: raw.launchpad ? { name: raw.launchpad } : undefined,
    }
  }
  return {
    id: raw.id,
    name: raw.name,
    net: raw.net,
    window_start: raw.window_start,
    providerName,
    providerType,
    pad: raw.pad
      ? {
          name: raw.pad?.name,
          latitude: raw.pad?.latitude,
          longitude: raw.pad?.longitude,
          location: raw.pad?.location ? { name: raw.pad?.location?.name } : undefined,
        }
      : undefined,
  }
}

function makeLaunchKey(launch: Launch) {
  const dateKey = launch.net || launch.window_start || 'unknown'
  if (launch.id) return `id:${launch.id}`
  return `name:${launch.name || 'unknown'}|${dateKey}`
}

function getLaunchTime(launch: Launch) {
  const dateStr = launch.net || launch.window_start
  if (!dateStr) return Number.POSITIVE_INFINITY
  const time = new Date(dateStr).getTime()
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
}

function inferProviderType(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('spacex')) return 'SpaceX'
  if (lower.includes('nasa') || lower.includes('artemis') || lower.includes('sls')) return 'NASA'
  if (lower.includes('blue origin')) return 'Blue Origin'
  if (lower.includes('virgin')) return 'Virgin Galactic'
  return 'Other'
}
