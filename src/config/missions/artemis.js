// src/config/missions/artemis.js
// Artemis Program configuration for mission control dashboard
// Data-driven architecture for easy updates and expansion

export const ARTEMIS_PROGRAM = {
  id: 'artemis',
  name: 'ARTEMIS PROGRAM',
  subtitle: 'Human return to the Moon | Deep space operations | Gateway preparation',
  status: 'ACTIVE',
  leadAgency: 'NASA',
  primaryRocket: 'Space Launch System (SLS)',
  crewVehicle: 'Orion',
  destination: 'Lunar Orbit / Surface',
  firstMission: 'ARTEMIS I (COMPLETED)',
  description: 'NASA\'s Artemis program will land the first woman and first person of color on the Moon, using innovative technologies to explore more of the lunar surface than ever before.',
}

export const ARTEMIS_IMAGES = {
  slsLaunch: {
    url: 'https://www.nasa.gov/wp-content/uploads/2022/11/artemis-i-launch-nhq202211160029.jpg',
    alt: 'Artemis I SLS Launch',
    caption: 'Space Launch System lifts off from Kennedy Space Center',
    credit: 'NASA/Bill Ingalls',
  },
  orionMoon: {
    url: 'https://www.nasa.gov/wp-content/uploads/2022/11/art001e000672-orig.jpg',
    alt: 'Orion spacecraft with Moon',
    caption: 'Orion spacecraft captures the Moon during Artemis I',
    credit: 'NASA',
  },
  orionEarth: {
    url: 'https://www.nasa.gov/wp-content/uploads/2022/11/art001e002132-orig.jpg',
    alt: 'Orion spacecraft with Earth',
    caption: 'Earth rises behind Orion during lunar flyby',
    credit: 'NASA',
  },
  slsRollout: {
    url: 'https://www.nasa.gov/wp-content/uploads/2022/08/ksc-20220816-ph-kls01-0001orig.jpg',
    alt: 'SLS on launch pad',
    caption: 'SLS and Orion on Launch Pad 39B',
    credit: 'NASA/Kim Shiflett',
  },
}

export const ARTEMIS_ROCKETS = {
  sls: {
    id: 'sls',
    name: 'Space Launch System (SLS)',
    manufacturer: 'Boeing / Northrop Grumman / Aerojet Rocketdyne',
    type: 'Super Heavy-Lift Launch Vehicle',
    configurations: {
      block1: {
        name: 'Block 1',
        payload_leo: '95,000 kg',
        payload_tli: '27,000 kg',
        thrust: '39,100 kN',
        height: '98 m',
        stages: 2,
        boosters: '2x Solid Rocket Boosters',
        missions: ['Artemis I', 'Artemis II', 'Artemis III'],
      },
      block1b: {
        name: 'Block 1B',
        payload_leo: '105,000 kg',
        payload_tli: '42,000 kg',
        thrust: '39,100 kN',
        height: '111 m',
        stages: 2,
        boosters: '2x Solid Rocket Boosters',
        upperStage: 'Exploration Upper Stage (EUS)',
        missions: ['Artemis IV+'],
      },
    },
    firstFlight: 'November 16, 2022',
    status: 'OPERATIONAL',
  },
}

export const ARTEMIS_SPACECRAFT = {
  orion: {
    id: 'orion',
    name: 'Orion Multi-Purpose Crew Vehicle',
    manufacturer: 'Lockheed Martin',
    type: 'Crew Capsule',
    crewCapacity: 4,
    missionDuration: '21 days (independent) / 6 months (docked)',
    serviceModule: 'European Service Module (ESM)',
    serviceModuleProvider: 'ESA / Airbus',
    heatShield: 'AVCOAT ablative heat shield',
    reentrySpeed: '40,000 km/h',
    capabilities: [
      'Deep space crew transport',
      'Lunar orbit operations',
      'Gateway docking',
      'Earth re-entry from lunar return trajectory',
    ],
    status: 'OPERATIONAL',
  },
  hls: {
    id: 'hls',
    name: 'Human Landing System (Starship HLS)',
    manufacturer: 'SpaceX',
    type: 'Lunar Lander',
    crewCapacity: 2,
    capabilities: [
      'Lunar surface descent',
      'Surface operations support',
      'Lunar ascent to orbit',
      'Orion docking',
    ],
    status: 'IN DEVELOPMENT',
  },
  gateway: {
    id: 'gateway',
    name: 'Lunar Gateway',
    type: 'Space Station',
    orbit: 'Near-Rectilinear Halo Orbit (NRHO)',
    modules: [
      { name: 'PPE', fullName: 'Power and Propulsion Element', provider: 'Maxar' },
      { name: 'HALO', fullName: 'Habitation and Logistics Outpost', provider: 'Northrop Grumman' },
      { name: 'I-HAB', fullName: 'International Habitation Module', provider: 'ESA / JAXA' },
    ],
    capabilities: [
      'Crew habitation',
      'Lunar surface mission staging',
      'Deep space research',
      'Mars mission preparation',
    ],
    status: 'IN DEVELOPMENT',
  },
}

export const ARTEMIS_SYSTEMS = [
  {
    id: 'navigation',
    name: 'Navigation & Guidance',
    description: 'Advanced inertial navigation with star tracker and GPS backup for cislunar operations.',
    importance: 'Enables precise trajectory corrections for lunar orbit insertion and Earth return.',
  },
  {
    id: 'life-support',
    name: 'Life Support (ECLSS)',
    description: 'Environmental Control and Life Support System providing atmosphere, water, and thermal regulation.',
    importance: 'Sustains crew for up to 21 days in deep space without resupply.',
  },
  {
    id: 'power',
    name: 'Power Systems',
    description: 'Solar array wings on European Service Module generating 11 kW of electrical power.',
    importance: 'Powers all spacecraft systems including propulsion, life support, and communications.',
  },
  {
    id: 'communications',
    name: 'Communications',
    description: 'S-band and Ka-band systems with Deep Space Network compatibility.',
    importance: 'Maintains continuous contact with Earth at lunar distances (384,400 km).',
  },
  {
    id: 'heat-shield',
    name: 'Heat Shield',
    description: 'AVCOAT ablative heat shield rated for lunar return velocities.',
    importance: 'Protects crew during re-entry at 40,000 km/h, the fastest human re-entry ever.',
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    description: 'Orbital Maneuvering System engine with 33 auxiliary thrusters.',
    importance: 'Provides trajectory corrections, lunar orbit insertion, and trans-Earth injection.',
  },
]

export const ARTEMIS_KNOWLEDGE = [
  {
    id: 'why-return',
    title: 'Why Return to the Moon?',
    content: 'The Moon serves as a proving ground for deep space exploration technologies. Artemis will establish sustainable lunar presence, test systems for Mars missions, and unlock scientific discoveries about the Moon\'s south pole water ice deposits.',
  },
  {
    id: 'apollo-difference',
    title: 'How Artemis Differs from Apollo',
    content: 'Unlike Apollo\'s flags-and-footprints approach, Artemis aims for sustainable presence. Key differences include: international partnerships, commercial providers, Gateway station, south pole landing sites, and technology development for Mars.',
  },
  {
    id: 'gateway-overview',
    title: 'Lunar Gateway Overview',
    content: 'Gateway is a small space station in lunar orbit serving as a staging point for lunar surface missions. It will orbit the Moon in a near-rectilinear halo orbit, providing access to the entire lunar surface over time.',
  },
  {
    id: 'mars-preparation',
    title: 'Mars Preparation Role',
    content: 'Artemis serves as a testbed for Mars mission technologies including: long-duration life support, deep space navigation, radiation protection, and crew health monitoring. Lessons learned will directly inform Mars mission architecture.',
  },
]

export const ARTEMIS_MISSIONS = [
  {
    id: 'artemis-1',
    name: 'ARTEMIS I',
    status: 'COMPLETED',
    missionType: 'Uncrewed Test Flight',
    launchDate: 'November 16, 2022',
    splashdownDate: 'December 11, 2022',
    duration: '25 days, 10 hours, 53 minutes',
    rocket: 'sls',
    rocketConfig: 'block1',
    spacecraft: ['orion'],
    crew: null,
    objectives: [
      'Validate Orion spacecraft systems in deep space environment',
      'Demonstrate SLS performance and reliability',
      'Test heat shield at lunar return velocities (40,000 km/h)',
      'Verify Orion recovery operations',
      'Collect flight data for crewed mission certification',
    ],
    achievements: [
      'Farthest distance traveled by human-rated spacecraft: 432,210 km',
      'Successful lunar flyby and distant retrograde orbit',
      'Heat shield performed nominally at re-entry',
      'All primary mission objectives achieved',
    ],
    highlights: [
      { label: 'Distance from Earth', value: '432,210 km' },
      { label: 'Lunar Flybys', value: '2' },
      { label: 'Orbit Type', value: 'Distant Retrograde Orbit' },
      { label: 'Splashdown Location', value: 'Pacific Ocean' },
    ],
  },
  {
    id: 'artemis-2',
    name: 'ARTEMIS II',
    status: 'PLANNED',
    missionType: 'Crewed Lunar Flyby',
    targetLaunch: 'September 2025',
    duration: '~10 days',
    rocket: 'sls',
    rocketConfig: 'block1',
    spacecraft: ['orion'],
    crew: {
      status: 'ASSIGNED',
      size: 4,
      members: [
        {
          name: 'Reid Wiseman',
          role: 'Commander',
          agency: 'NASA',
          previousMissions: ['Expedition 40/41'],
        },
        {
          name: 'Victor Glover',
          role: 'Pilot',
          agency: 'NASA',
          previousMissions: ['Crew-1', 'Expedition 64'],
        },
        {
          name: 'Christina Koch',
          role: 'Mission Specialist',
          agency: 'NASA',
          previousMissions: ['Expedition 59/60/61'],
        },
        {
          name: 'Jeremy Hansen',
          role: 'Mission Specialist',
          agency: 'CSA',
          previousMissions: [],
        },
      ],
    },
    objectives: [
      'First crewed flight of Orion spacecraft',
      'First crewed flight of SLS rocket',
      'Validate life support systems with crew aboard',
      'Demonstrate crew operations in deep space',
      'Lunar flyby trajectory verification',
    ],
    highlights: [
      { label: 'Crew Size', value: '4 astronauts' },
      { label: 'Mission Type', value: 'Free-return trajectory' },
      { label: 'First Canadian', value: 'Jeremy Hansen' },
      { label: 'Lunar Distance', value: '~10,000 km from surface' },
    ],
  },
  {
    id: 'artemis-3',
    name: 'ARTEMIS III',
    status: 'PLANNED',
    missionType: 'Crewed Lunar Landing',
    targetLaunch: '2026',
    duration: '~30 days',
    rocket: 'sls',
    rocketConfig: 'block1',
    spacecraft: ['orion', 'hls'],
    crew: {
      status: 'TBD',
      size: 4,
      landingCrew: 2,
      members: null,
    },
    objectives: [
      'First crewed lunar landing since Apollo 17 (1972)',
      'First woman on the lunar surface',
      'First person of color on the lunar surface',
      'South pole region exploration',
      'Demonstrate Human Landing System (Starship HLS)',
      'Conduct lunar surface science operations',
    ],
    highlights: [
      { label: 'Landing Site', value: 'Lunar South Pole Region' },
      { label: 'Surface Time', value: '~6.5 days' },
      { label: 'EVAs Planned', value: '2+' },
      { label: 'Lander', value: 'SpaceX Starship HLS' },
    ],
  },
  {
    id: 'artemis-4',
    name: 'ARTEMIS IV',
    status: 'PLANNED',
    missionType: 'Gateway Assembly',
    targetLaunch: '2028',
    duration: '~30 days',
    rocket: 'sls',
    rocketConfig: 'block1b',
    spacecraft: ['orion', 'gateway'],
    crew: {
      status: 'TBD',
      size: 4,
      members: null,
    },
    objectives: [
      'First crewed mission to Lunar Gateway',
      'Deliver I-HAB module to Gateway',
      'First use of SLS Block 1B configuration',
      'Establish Gateway as operational outpost',
      'Demonstrate long-duration lunar orbit operations',
    ],
    highlights: [
      { label: 'Gateway Module', value: 'I-HAB delivery' },
      { label: 'SLS Config', value: 'Block 1B (first flight)' },
      { label: 'Orbit', value: 'Near-Rectilinear Halo Orbit' },
      { label: 'Station Partners', value: 'NASA, ESA, JAXA, CSA' },
    ],
  },
]

export const MISSION_STATUS_COLORS = {
  COMPLETED: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#22c55e' },
  PLANNED: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.5)', text: '#3b82f6' },
  ACTIVE: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.5)', text: '#eab308' },
  'IN DEVELOPMENT': { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.5)', text: '#a855f7' },
  TBD: { bg: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 0.5)', text: '#6b7280' },
  ASSIGNED: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#22c55e' },
}
