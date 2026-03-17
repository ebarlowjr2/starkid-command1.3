import type { Alert } from '@starkid/types'
import type { ServiceResult, SourceStatus } from './types'

type ArtemisSummary = {
  programName: string
  description: string
  nextMission: string
  nextMissionDate: string | null
  sourceUrl: string
  missionUrl: string
  programTag: string
}

const ARTEMIS_SUMMARY: ArtemisSummary = {
  programName: 'Artemis',
  description:
    'NASA’s Artemis program is returning humans to the Moon and preparing for future missions to Mars.',
  nextMission: 'Artemis II',
  nextMissionDate: '2026-04-01T00:00:00Z',
  sourceUrl: 'https://www.nasa.gov/artemis/',
  missionUrl: 'https://www.nasa.gov/missions/artemis-ii/',
  programTag: 'Artemis',
}

export async function getArtemisProgramSummary(): Promise<ServiceResult<ArtemisSummary>> {
  const sources: SourceStatus[] = [{ name: 'nasa-artemis', ok: true, count: 1 }]
  return { data: ARTEMIS_SUMMARY, sources }
}

export async function getArtemisUpcomingEvents(): Promise<ServiceResult<Alert[]>> {
  const summary = ARTEMIS_SUMMARY
  const alerts: Alert[] = [
    {
      id: 'artemis:priority',
      type: 'artemis',
      category: 'artemis',
      title: `${summary.nextMission} • Next Major Milestone`,
      description: summary.description,
      severity: 'high',
      priority: 5,
      startTime: summary.nextMissionDate,
      source: 'nasa-artemis',
      sourceUrl: summary.missionUrl,
      programTag: summary.programTag,
      missionAvailable: true,
      payload: summary,
    },
  ]
  return { data: alerts, sources: [{ name: 'nasa-artemis', ok: true, count: alerts.length }] }
}

export async function getArtemisPriorityAlert(): Promise<ServiceResult<Alert | null>> {
  const result = await getArtemisUpcomingEvents()
  return { data: result.data[0] || null, sources: result.sources }
}

export async function getArtemisPageData(): Promise<ServiceResult<ArtemisSummary>> {
  return getArtemisProgramSummary()
}
