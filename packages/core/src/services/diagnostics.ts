import type { SourceStatus } from './types'

export function formatSourceStatus(sources: SourceStatus[]) {
  return sources
    .map((source) => {
      if (source.ok) {
        const count = typeof source.count === 'number' ? ` (${source.count})` : ''
        return `${source.name}: ok${count}`
      }
      return `${source.name}: failed${source.error ? ` (${source.error})` : ''}`
    })
    .join(' | ')
}
