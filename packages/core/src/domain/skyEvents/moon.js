// src/lib/moon.js
// Moon phase data using calculation-based approach

/**
 * Calculate moon phase based on date
 * Returns phase information including name, illumination, and upcoming phases
 */
export async function getMoonSummary(date = new Date()) {
  const moonData = calculateMoonPhase(date)
  const nextPhases = getNextMoonPhases(date)
  
  return {
    phaseName: moonData.phaseName,
    illumination: moonData.illumination,
    isFullMoonSoon: moonData.illumination > 0.85 || isWithinDays(nextPhases.nextFullMoon, 3),
    nextFullMoon: nextPhases.nextFullMoon,
    nextNewMoon: nextPhases.nextNewMoon,
    age: moonData.age,
    emoji: moonData.emoji
  }
}

/**
 * Calculate moon phase using synodic month calculation
 * Based on a known new moon date and the synodic month length
 */
function calculateMoonPhase(date) {
  // Known new moon: January 11, 2024 at 11:57 UTC
  const knownNewMoon = new Date('2024-01-11T11:57:00Z')
  const synodicMonth = 29.53058867 // days
  
  const daysSinceNewMoon = (date - knownNewMoon) / (1000 * 60 * 60 * 24)
  const lunarAge = ((daysSinceNewMoon % synodicMonth) + synodicMonth) % synodicMonth
  
  // Calculate illumination (0 to 1)
  // Illumination follows a cosine curve through the lunar cycle
  const illumination = (1 - Math.cos((lunarAge / synodicMonth) * 2 * Math.PI)) / 2
  
  // Determine phase name and emoji
  const { phaseName, emoji } = getPhaseInfo(lunarAge, synodicMonth)
  
  return {
    age: lunarAge,
    illumination: Math.round(illumination * 100) / 100,
    phaseName,
    emoji
  }
}

/**
 * Get phase name and emoji based on lunar age
 */
function getPhaseInfo(age, synodicMonth) {
  const phaseLength = synodicMonth / 8
  
  if (age < phaseLength) {
    return { phaseName: 'New Moon', emoji: '🌑' }
  } else if (age < phaseLength * 2) {
    return { phaseName: 'Waxing Crescent', emoji: '🌒' }
  } else if (age < phaseLength * 3) {
    return { phaseName: 'First Quarter', emoji: '🌓' }
  } else if (age < phaseLength * 4) {
    return { phaseName: 'Waxing Gibbous', emoji: '🌔' }
  } else if (age < phaseLength * 5) {
    return { phaseName: 'Full Moon', emoji: '🌕' }
  } else if (age < phaseLength * 6) {
    return { phaseName: 'Waning Gibbous', emoji: '🌖' }
  } else if (age < phaseLength * 7) {
    return { phaseName: 'Last Quarter', emoji: '🌗' }
  } else {
    return { phaseName: 'Waning Crescent', emoji: '🌘' }
  }
}

/**
 * Calculate next full moon and new moon dates
 */
function getNextMoonPhases(fromDate) {
  const knownNewMoon = new Date('2024-01-11T11:57:00Z')
  const synodicMonth = 29.53058867 // days
  const synodicMs = synodicMonth * 24 * 60 * 60 * 1000
  
  // Find the most recent new moon before fromDate
  const daysSinceKnown = (fromDate - knownNewMoon) / (1000 * 60 * 60 * 24)
  const cyclesSinceKnown = Math.floor(daysSinceKnown / synodicMonth)
  
  // Calculate recent new moon
  let recentNewMoon = new Date(knownNewMoon.getTime() + cyclesSinceKnown * synodicMs)
  
  // If recent new moon is in the future, go back one cycle
  if (recentNewMoon > fromDate) {
    recentNewMoon = new Date(recentNewMoon.getTime() - synodicMs)
  }
  
  // Next new moon
  let nextNewMoon = new Date(recentNewMoon.getTime() + synodicMs)
  if (nextNewMoon <= fromDate) {
    nextNewMoon = new Date(nextNewMoon.getTime() + synodicMs)
  }
  
  // Full moon is approximately half a synodic month after new moon
  const halfSynodic = synodicMs / 2
  let nextFullMoon = new Date(recentNewMoon.getTime() + halfSynodic)
  
  // If full moon has passed, calculate next one
  if (nextFullMoon <= fromDate) {
    nextFullMoon = new Date(nextFullMoon.getTime() + synodicMs)
  }
  
  return {
    nextNewMoon: nextNewMoon.toISOString(),
    nextFullMoon: nextFullMoon.toISOString()
  }
}

/**
 * Check if a date is within N days from now
 */
function isWithinDays(isoDateString, days) {
  if (!isoDateString) return false
  const targetDate = new Date(isoDateString)
  const now = new Date()
  const diffDays = (targetDate - now) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

/**
 * Get a kid-friendly description of the current moon phase
 */
export function getMoonDescription(phaseName) {
  const descriptions = {
    'New Moon': 'The Moon is hiding! It\'s between Earth and the Sun, so we can\'t see it.',
    'Waxing Crescent': 'A tiny sliver of Moon is appearing! It\'s growing bigger each night.',
    'First Quarter': 'Half the Moon is lit up! It looks like a perfect half-circle.',
    'Waxing Gibbous': 'The Moon is almost full! Just a little bit more to go.',
    'Full Moon': 'The whole Moon is shining bright! Perfect night for Moon watching.',
    'Waning Gibbous': 'The Moon is starting to shrink. Still very bright though!',
    'Last Quarter': 'Half the Moon is lit again, but the other half this time.',
    'Waning Crescent': 'Just a tiny sliver left. Soon it will be a New Moon again!'
  }
  return descriptions[phaseName] || 'The Moon is up there somewhere!'
}

export { calculateMoonPhase, getNextMoonPhases }
