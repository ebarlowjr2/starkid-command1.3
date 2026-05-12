import type { Comet } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'
import { CURATED_COMETS, searchComets as searchCometsDomain, getNotableComets as getNotableCometsDomain, getCometByDesignation as getCometByDesignationDomain } from '../domain/comets/cometsData.js'

type CometOverrides = {
  comets?: Comet[]
}

export async function getComets({
  query,
  notableOnly = false,
  sourcesOverride,
}: {
  query?: string
  notableOnly?: boolean
  sourcesOverride?: CometOverrides
} = {}): Promise<ServiceResult<Comet[]>> {
  const sources: SourceStatus[] = []
  let data: Comet[] = []

  if (sourcesOverride?.comets) {
    data = sourcesOverride.comets
    sources.push({ name: 'curated', ok: true, count: data.length })
  } else if (notableOnly) {
    data = getNotableCometsDomain()
    sources.push({ name: 'curated', ok: true, count: data.length })
  } else if (query) {
    data = searchCometsDomain(query)
    sources.push({ name: 'curated', ok: true, count: data.length })
  } else {
    data = CURATED_COMETS
    sources.push({ name: 'curated', ok: true, count: data.length })
  }

  return { data, sources }
}

export async function getCometByDesignation(designation: string): Promise<ServiceResult<Comet | null>> {
  const comet = getCometByDesignationDomain(designation)
  return { data: comet, sources: [{ name: 'curated', ok: true, count: comet ? 1 : 0 }] }
}
