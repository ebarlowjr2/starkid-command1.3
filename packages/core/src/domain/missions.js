// src/lib/missions.js
// Mission generation logic for Tonight's Sky Mission page

import { getMoonSummary, getMoonDescription } from './moon.js'
import { getSkyEvents } from './skyEvents.js'

/**
 * Generate tonight's missions based on current sky conditions
 * Returns 1-3 missions tailored to what's visible tonight
 */
export async function getTonightsMissions() {
  const now = new Date()
  const missions = []

  try {
    const [moon, events] = await Promise.all([
      getMoonSummary(now),
      getSkyEvents({ start: now, days: 1 })
    ])

    // Check for meteor shower tonight
    const meteor = events.find(ev => ev.type === 'meteor-shower')
    if (meteor) {
      missions.push({
        id: 'meteor',
        title: 'Meteor Shower Patrol',
        difficulty: 'medium',
        tags: ['meteor-shower'],
        recommendedTime: 'after 10:00 PM',
        description: `Tonight the ${meteor.title} are active! Go outside with an adult, lie back on a blanket, and count how many "shooting stars" you see in 10 minutes. ${meteor.visibility || ''}`,
        points: 50
      })
    }

    // Check for conjunction or planet event tonight
    const conjunction = events.find(ev => ev.type === 'conjunction' || ev.type === 'planet-event')
    if (conjunction) {
      missions.push({
        id: 'conjunction',
        title: 'Planet Buddy Watch',
        difficulty: 'easy',
        tags: ['planets'],
        recommendedTime: conjunction.visibility?.includes('morning') ? 'before sunrise' : 'after sunset',
        description: `Special event tonight: ${conjunction.title}! ${conjunction.description || ''} Try to spot it and draw what you see.`,
        points: 30
      })
    }

    // Moon-based missions
    if (moon) {
      if (moon.illumination > 0.8) {
        missions.push({
          id: 'moon-full',
          title: 'Full Moon Sketch',
          difficulty: 'easy',
          tags: ['moon'],
          recommendedTime: 'after dark',
          description: `The Moon is ${Math.round(moon.illumination * 100)}% lit tonight (${moon.phaseName})! ${getMoonDescription(moon.phaseName)} Draw the Moon and try to mark any dark patches (called "maria") you can see.`,
          points: 25
        })
      } else if (moon.illumination > 0.4 && moon.illumination <= 0.8) {
        missions.push({
          id: 'moon-phase',
          title: 'Moon Phase Detective',
          difficulty: 'easy',
          tags: ['moon'],
          recommendedTime: 'after dark',
          description: `Tonight's Moon is in the "${moon.phaseName}" phase (${Math.round(moon.illumination * 100)}% lit). ${getMoonDescription(moon.phaseName)} Can you figure out if the Moon is getting bigger (waxing) or smaller (waning)?`,
          points: 20
        })
      } else if (moon.illumination <= 0.4 && moon.illumination > 0.1) {
        missions.push({
          id: 'moon-crescent',
          title: 'Crescent Moon Hunt',
          difficulty: 'medium',
          tags: ['moon'],
          recommendedTime: moon.phaseName.includes('Waxing') ? 'just after sunset' : 'just before sunrise',
          description: `The Moon is just a thin crescent tonight (${Math.round(moon.illumination * 100)}% lit)! ${getMoonDescription(moon.phaseName)} This is a great time to look for "Earthshine" - the faint glow on the dark part of the Moon caused by light reflecting off Earth!`,
          points: 35
        })
      }
    }

    // Eclipse check
    const eclipse = events.find(ev => ev.type === 'eclipse')
    if (eclipse) {
      missions.push({
        id: 'eclipse',
        title: 'Eclipse Watch',
        difficulty: 'medium',
        tags: ['eclipse', 'special'],
        recommendedTime: 'check local times',
        description: `SPECIAL EVENT: ${eclipse.title}! ${eclipse.description || ''} ${eclipse.visibility || ''} Remember: NEVER look directly at the Sun without proper eclipse glasses!`,
        points: 100
      })
    }

    // Add fallback missions if we don't have enough
    if (missions.length < 2) {
      missions.push(...getFallbackMissions(missions.length))
    }

  } catch (error) {
    console.error('Error generating missions:', error)
    // Return fallback missions if there's an error
    return getFallbackMissions(0)
  }

  // Return up to 3 missions, prioritizing special events
  return missions.slice(0, 3)
}

/**
 * Get fallback missions when no special events are happening
 */
function getFallbackMissions(existingCount) {
  const fallbacks = [
    {
      id: 'star-scout',
      title: 'Star Scout',
      difficulty: 'easy',
      tags: ['stars'],
      recommendedTime: 'after dark',
      description: 'Pick a direction in the sky and count how many bright stars you see. Find the brightest one and give it your own special name!',
      points: 15
    },
    {
      id: 'big-dipper',
      title: 'Find the Big Dipper',
      difficulty: 'easy',
      tags: ['constellations'],
      recommendedTime: 'after dark, look north',
      description: 'The Big Dipper is one of the easiest star patterns to find! It looks like a giant ladle or cup with a long handle. Can you find it? Hint: Look toward the north.',
      points: 20
    },
    {
      id: 'planet-hunt',
      title: 'Planet Hunter',
      difficulty: 'medium',
      tags: ['planets'],
      recommendedTime: 'after dark',
      description: 'Planets don\'t twinkle like stars - they shine with a steady light! Look for any bright "stars" that don\'t twinkle. You might have found a planet! Venus, Jupiter, and Mars are often visible.',
      points: 25
    },
    {
      id: 'constellation-create',
      title: 'Create Your Own Constellation',
      difficulty: 'easy',
      tags: ['stars', 'creative'],
      recommendedTime: 'after dark',
      description: 'Ancient people made up stories about star patterns they saw. Tonight, find a group of stars and imagine your own picture! Draw it and give it a name.',
      points: 20
    },
    {
      id: 'night-sounds',
      title: 'Night Sky Scientist',
      difficulty: 'easy',
      tags: ['observation'],
      recommendedTime: 'after dark',
      description: 'Spend 5 minutes outside looking at the sky. Write down 3 things you notice: What colors do you see? Are some stars brighter than others? Can you see any airplanes or satellites?',
      points: 15
    },
    {
      id: 'iss-watch',
      title: 'Space Station Spotter',
      difficulty: 'medium',
      tags: ['iss', 'satellites'],
      recommendedTime: 'check spotthestation.nasa.gov',
      description: 'The International Space Station flies over most places on Earth! It looks like a very bright, fast-moving star. Check NASA\'s "Spot the Station" website to see when it passes over your area.',
      points: 40
    }
  ]

  // Return enough fallbacks to have at least 2 missions total
  const needed = Math.max(0, 2 - existingCount)
  return fallbacks.slice(0, needed)
}

/**
 * Get total points for completed missions
 */
export function calculateTotalPoints(completedMissions, allMissions) {
  return allMissions
    .filter(m => completedMissions[m.id])
    .reduce((total, m) => total + (m.points || 0), 0)
}

/**
 * Get badge based on total points
 */
export function getBadgeForPoints(points) {
  if (points >= 200) return { name: 'Galaxy Explorer', emoji: '🌌', level: 5 }
  if (points >= 150) return { name: 'Star Commander', emoji: '⭐', level: 4 }
  if (points >= 100) return { name: 'Moon Walker', emoji: '🌙', level: 3 }
  if (points >= 50) return { name: 'Sky Cadet', emoji: '🔭', level: 2 }
  if (points >= 20) return { name: 'Star Gazer', emoji: '✨', level: 1 }
  return { name: 'Space Rookie', emoji: '🚀', level: 0 }
}

export { getFallbackMissions }
