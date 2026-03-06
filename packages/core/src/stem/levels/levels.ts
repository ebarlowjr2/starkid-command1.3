import type { StemLevel } from '../types'

const LEVELS: Record<StemLevel, { maxSteps: number; hintStyle: string; difficultyScore: number; allowMultiVariable: boolean }> = {
  cadet: { maxSteps: 1, hintStyle: 'direct', difficultyScore: 1, allowMultiVariable: false },
  explorer: { maxSteps: 2, hintStyle: 'guided', difficultyScore: 2, allowMultiVariable: false },
  specialist: { maxSteps: 3, hintStyle: 'strategic', difficultyScore: 3, allowMultiVariable: true },
  operator: { maxSteps: 3, hintStyle: 'minimal', difficultyScore: 4, allowMultiVariable: true },
}

export function getLevelConfig(level: StemLevel) {
  return LEVELS[level]
}
