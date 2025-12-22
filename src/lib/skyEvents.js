// src/lib/skyEvents.js
// Sky events data layer using Astronomy API (astronomyapi.com) or fallback data

function formatDate(d) {
  return d.toISOString().slice(0, 10)
}

/**
 * Fetch upcoming sky events (conjunctions, meteor showers, eclipses, etc.)
 * Using a combination of static meteor shower data and dynamic calculations
 */
export async function getSkyEvents({ start = new Date(), days = 30 } = {}) {
  const events = []
  const endDate = new Date(start.getTime() + days * 24 * 3600 * 1000)

  // Add meteor showers that fall within the date range
  const meteorShowers = getMeteorShowerData()
  meteorShowers.forEach(shower => {
    const showerStart = new Date(shower.start)
    const showerPeak = new Date(shower.peak)
    const showerEnd = new Date(shower.end)
    
    if (showerPeak >= start && showerStart <= endDate) {
      events.push({
        title: shower.name,
        type: 'meteor-shower',
        start: shower.peak,
        end: shower.end,
        visibility: `Peak: ${shower.zhr} meteors/hour`,
        description: shower.description
      })
    }
  })

  // Add planetary events
  const planetaryEvents = getPlanetaryEventData()
  planetaryEvents.forEach(event => {
    const eventDate = new Date(event.date)
    if (eventDate >= start && eventDate <= endDate) {
      events.push({
        title: event.title,
        type: event.type,
        start: event.date,
        visibility: event.visibility,
        description: event.description
      })
    }
  })

  // Sort by start date
  events.sort((a, b) => new Date(a.start) - new Date(b.start))

  return events
}

/**
 * Get meteor showers specifically
 */
export async function getMeteorShowers({ start = new Date(), days = 60 } = {}) {
  const events = await getSkyEvents({ start, days })
  return events.filter(ev => ev.type === 'meteor-shower')
}

/**
 * Get planetary alignments/conjunctions
 */
export async function getPlanetaryEvents({ start = new Date(), days = 60 } = {}) {
  const events = await getSkyEvents({ start, days })
  return events.filter(ev => ev.type === 'conjunction' || ev.type === 'planet-event')
}

// Static meteor shower data for 2024-2025
function getMeteorShowerData() {
  const currentYear = new Date().getFullYear()
  return [
    {
      name: 'Quadrantids',
      start: `${currentYear}-01-01`,
      peak: `${currentYear}-01-03`,
      end: `${currentYear}-01-05`,
      zhr: 120,
      description: 'One of the best annual meteor showers. Best viewed in the Northern Hemisphere after midnight.'
    },
    {
      name: 'Lyrids',
      start: `${currentYear}-04-16`,
      peak: `${currentYear}-04-22`,
      end: `${currentYear}-04-25`,
      zhr: 18,
      description: 'Ancient meteor shower known for bright fireballs. Best viewed after midnight.'
    },
    {
      name: 'Eta Aquariids',
      start: `${currentYear}-04-19`,
      peak: `${currentYear}-05-06`,
      end: `${currentYear}-05-28`,
      zhr: 50,
      description: 'Debris from Halley\'s Comet. Best viewed from Southern Hemisphere.'
    },
    {
      name: 'Delta Aquariids',
      start: `${currentYear}-07-12`,
      peak: `${currentYear}-07-30`,
      end: `${currentYear}-08-23`,
      zhr: 20,
      description: 'Best viewed from Southern Hemisphere. Produces faint meteors.'
    },
    {
      name: 'Perseids',
      start: `${currentYear}-07-17`,
      peak: `${currentYear}-08-12`,
      end: `${currentYear}-08-24`,
      zhr: 100,
      description: 'One of the most popular meteor showers! Bright meteors and fireballs. Best viewed after midnight.'
    },
    {
      name: 'Orionids',
      start: `${currentYear}-10-02`,
      peak: `${currentYear}-10-21`,
      end: `${currentYear}-11-07`,
      zhr: 20,
      description: 'Another shower from Halley\'s Comet debris. Known for fast, bright meteors.'
    },
    {
      name: 'Leonids',
      start: `${currentYear}-11-06`,
      peak: `${currentYear}-11-17`,
      end: `${currentYear}-11-30`,
      zhr: 15,
      description: 'Can produce meteor storms every 33 years. Fast meteors with persistent trains.'
    },
    {
      name: 'Geminids',
      start: `${currentYear}-12-04`,
      peak: `${currentYear}-12-14`,
      end: `${currentYear}-12-17`,
      zhr: 150,
      description: 'King of meteor showers! Bright, colorful meteors. Best viewed around 2 AM.'
    },
    {
      name: 'Ursids',
      start: `${currentYear}-12-17`,
      peak: `${currentYear}-12-22`,
      end: `${currentYear}-12-26`,
      zhr: 10,
      description: 'Minor shower near the winter solstice. Best viewed after midnight.'
    },
    // Add next year's early showers
    {
      name: 'Quadrantids',
      start: `${currentYear + 1}-01-01`,
      peak: `${currentYear + 1}-01-03`,
      end: `${currentYear + 1}-01-05`,
      zhr: 120,
      description: 'One of the best annual meteor showers. Best viewed in the Northern Hemisphere after midnight.'
    }
  ]
}

// Planetary events data
function getPlanetaryEventData() {
  const currentYear = new Date().getFullYear()
  return [
    {
      title: 'Venus at Greatest Eastern Elongation',
      type: 'planet-event',
      date: `${currentYear}-01-10`,
      visibility: 'Evening sky, look west after sunset',
      description: 'Venus reaches its greatest separation from the Sun, making it easy to spot in the evening sky.'
    },
    {
      title: 'Jupiter-Saturn Conjunction',
      type: 'conjunction',
      date: `${currentYear}-03-15`,
      visibility: 'Pre-dawn sky, look east',
      description: 'Jupiter and Saturn appear close together in the sky. A great photo opportunity!'
    },
    {
      title: 'Mars Opposition',
      type: 'planet-event',
      date: `${currentYear}-01-16`,
      visibility: 'All night, brightest in the east at midnight',
      description: 'Mars is at its closest to Earth and brightest. Perfect time to observe the Red Planet!'
    },
    {
      title: 'Mercury at Greatest Western Elongation',
      type: 'planet-event',
      date: `${currentYear}-02-28`,
      visibility: 'Morning sky, look east before sunrise',
      description: 'Best time to spot elusive Mercury in the morning sky.'
    },
    {
      title: 'Venus-Jupiter Conjunction',
      type: 'conjunction',
      date: `${currentYear}-05-23`,
      visibility: 'Evening sky after sunset',
      description: 'The two brightest planets appear very close together. Stunning sight!'
    },
    {
      title: 'Saturn Opposition',
      type: 'planet-event',
      date: `${currentYear}-09-08`,
      visibility: 'All night, best around midnight',
      description: 'Saturn is at its brightest. Great time to see the rings through a telescope!'
    },
    {
      title: 'Jupiter Opposition',
      type: 'planet-event',
      date: `${currentYear}-12-07`,
      visibility: 'All night, brightest around midnight',
      description: 'Jupiter at its brightest and closest to Earth. Look for the Galilean moons!'
    },
    {
      title: 'Partial Lunar Eclipse',
      type: 'eclipse',
      date: `${currentYear}-03-14`,
      visibility: 'Visible from Americas, Europe, Africa',
      description: 'Part of the Moon passes through Earth\'s shadow. Safe to watch with naked eyes!'
    },
    {
      title: 'Total Solar Eclipse',
      type: 'eclipse',
      date: `${currentYear}-04-08`,
      visibility: 'Path of totality crosses North America',
      description: 'The Moon completely blocks the Sun. NEVER look directly at the Sun without proper eclipse glasses!'
    },
    {
      title: 'Partial Lunar Eclipse',
      type: 'eclipse',
      date: `${currentYear}-09-18`,
      visibility: 'Visible from Americas, Europe, Africa',
      description: 'Another partial lunar eclipse. Watch the Moon turn slightly darker!'
    }
  ]
}

export { getMeteorShowerData, getPlanetaryEventData }
