import type { StemMission } from '../types'

export function augmentMissionText(base: StemMission, context?: Record<string, unknown>) {
  return {
    ...base,
    title: `🚀 ${base.title}`,
    briefing: `${base.briefing} (Field notes calibrated.)`,
    aiAugmented: true,
  }
}

export function augmentHints(base: StemMission, context?: Record<string, unknown>) {
  return {
    ...base,
    briefing: `${base.briefing} Hint: focus on the primary variable.`,
    aiAugmented: true,
  }
}
