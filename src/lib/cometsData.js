/**
 * Curated list of notable comets for discovery/search
 * Includes both periodic comets and recent notable visitors
 */

export const CURATED_COMETS = [
  {
    designation: '1P',
    name: "Halley's Comet",
    description: 'The most famous periodic comet, visible from Earth every 75-79 years. Last appeared in 1986, next perihelion in 2061.',
    period: '75-79 years',
    lastPerihelion: '1986-02-09',
    nextPerihelion: '2061-07-28',
    notable: true
  },
  {
    designation: '2P',
    name: 'Encke',
    description: 'Has the shortest orbital period of any known comet at 3.3 years. Associated with the Taurid meteor shower.',
    period: '3.3 years',
    lastPerihelion: '2023-10-22',
    nextPerihelion: '2027-01-21',
    notable: true
  },
  {
    designation: '12P',
    name: 'Pons-Brooks',
    description: 'A periodic comet known for its outbursts. Made a spectacular appearance in early 2024 with a distinctive "horned" shape.',
    period: '71 years',
    lastPerihelion: '2024-04-21',
    nextPerihelion: '2095',
    notable: true
  },
  {
    designation: '29P',
    name: 'Schwassmann-Wachmann 1',
    description: 'Known for frequent outbursts that can increase its brightness by 100x. Orbits between Jupiter and Saturn.',
    period: '14.7 years',
    lastPerihelion: '2019-03-07',
    nextPerihelion: '2033-10',
    notable: false
  },
  {
    designation: '46P',
    name: 'Wirtanen',
    description: 'A small short-period comet that made a close approach to Earth in December 2018, becoming visible to the naked eye.',
    period: '5.4 years',
    lastPerihelion: '2024-01-27',
    nextPerihelion: '2029-06',
    notable: false
  },
  {
    designation: '67P',
    name: 'Churyumov-Gerasimenko',
    description: 'Target of the Rosetta mission. The Philae lander touched down on this comet in 2014, making history.',
    period: '6.4 years',
    lastPerihelion: '2021-11-02',
    nextPerihelion: '2028-03',
    notable: true
  },
  {
    designation: 'C/2020 F3',
    name: 'NEOWISE',
    description: 'A spectacular long-period comet discovered in March 2020. Became one of the brightest comets visible from the Northern Hemisphere in decades.',
    period: '~6,800 years',
    lastPerihelion: '2020-07-03',
    nextPerihelion: '~8800',
    notable: true
  },
  {
    designation: 'C/2022 E3',
    name: 'ZTF',
    description: 'A long-period comet that made its closest approach to Earth in February 2023. Displayed a distinctive green coma.',
    period: '~50,000 years',
    lastPerihelion: '2023-01-12',
    nextPerihelion: 'Unknown',
    notable: true
  },
  {
    designation: 'C/2023 A3',
    name: 'Tsuchinshan-ATLAS',
    description: 'A bright comet discovered in early 2023. Expected to be visible to the naked eye in late 2024.',
    period: '~80,000 years',
    lastPerihelion: '2024-09-27',
    nextPerihelion: 'Unknown',
    notable: true
  },
  {
    designation: 'C/2024 G3',
    name: 'ATLAS',
    description: 'A sungrazing comet discovered in April 2024. Expected to make a very close approach to the Sun.',
    period: 'Unknown',
    lastPerihelion: '2025-01-13',
    nextPerihelion: 'Unknown',
    notable: true
  },
  {
    designation: '81P',
    name: 'Wild 2',
    description: 'Target of NASA\'s Stardust mission, which collected samples from its coma and returned them to Earth in 2006.',
    period: '6.4 years',
    lastPerihelion: '2022-03-16',
    nextPerihelion: '2028-07',
    notable: false
  },
  {
    designation: '103P',
    name: 'Hartley 2',
    description: 'A small periodic comet visited by NASA\'s EPOXI mission in 2010. Known for its peanut shape.',
    period: '6.5 years',
    lastPerihelion: '2023-10-12',
    nextPerihelion: '2030-04',
    notable: false
  },
  {
    designation: 'C/1995 O1',
    name: 'Hale-Bopp',
    description: 'One of the most widely observed comets of the 20th century. Visible to the naked eye for a record 18 months in 1996-1997.',
    period: '~2,500 years',
    lastPerihelion: '1997-04-01',
    nextPerihelion: '~4500',
    notable: true
  },
  {
    designation: 'C/1996 B2',
    name: 'Hyakutake',
    description: 'A long-period comet that made an extremely close approach to Earth in 1996, displaying a spectacular tail.',
    period: '~70,000 years',
    lastPerihelion: '1996-05-01',
    nextPerihelion: 'Unknown',
    notable: true
  },
  {
    designation: '9P',
    name: 'Tempel 1',
    description: 'Target of NASA\'s Deep Impact mission in 2005, which deliberately crashed a probe into the comet to study its composition.',
    period: '5.5 years',
    lastPerihelion: '2022-03-04',
    nextPerihelion: '2027-08',
    notable: false
  }
]

/**
 * Search comets by name or designation
 * @param {string} query
 * @returns {Array}
 */
export function searchComets(query) {
  if (!query || query.trim().length === 0) {
    return CURATED_COMETS
  }
  
  const lowerQuery = query.toLowerCase().trim()
  
  return CURATED_COMETS.filter(comet => 
    comet.designation.toLowerCase().includes(lowerQuery) ||
    comet.name.toLowerCase().includes(lowerQuery) ||
    comet.description.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get a comet by designation
 * @param {string} designation
 * @returns {Object|null}
 */
export function getCometByDesignation(designation) {
  return CURATED_COMETS.find(c => c.designation === designation) || null
}

/**
 * Get notable/popular comets
 * @returns {Array}
 */
export function getNotableComets() {
  return CURATED_COMETS.filter(c => c.notable)
}
