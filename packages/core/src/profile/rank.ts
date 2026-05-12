export type RankName = 'Cadet' | 'Explorer' | 'Specialist' | 'Operator' | 'Commander'

export function rankForXp(xpTotal: number): RankName {
  const xp = Number.isFinite(xpTotal) ? xpTotal : 0
  if (xp >= 1000) return 'Commander'
  if (xp >= 500) return 'Operator'
  if (xp >= 200) return 'Specialist'
  if (xp >= 75) return 'Explorer'
  return 'Cadet'
}

