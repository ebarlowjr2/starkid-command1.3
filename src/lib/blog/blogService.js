const BLOG_POSTS = [
  {
    slug: 'welcome-to-starkid-command',
    title: 'Welcome to StarKid Command',
    date: '2025-01-05',
    summary: 'Introducing StarKid Command - your mission control for exploring the cosmos. Learn about our features and how to get started.',
    tags: ['announcement', 'getting-started'],
    coverImage: null,
    content: `
# Welcome to StarKid Command

Welcome, Junior Science Officers! StarKid Command is your personal mission control center for exploring the wonders of our solar system and beyond.

## What You Can Explore

### Solar System
Use our 3D Solar Map to navigate through the planets, moons, and other celestial bodies in our cosmic neighborhood. Watch the planets orbit the Sun in real-time!

### Mars Command Center
Visit the Red Planet and see daily photos from NASA's Curiosity rover. Learn about Mars weather, terrain, and the ongoing search for signs of ancient life.

### Beyond Our Solar System
Discover exoplanets - worlds orbiting distant stars. Learn how scientists detect these far-away planets and which ones might be habitable.

### Rocket Science
Explore the rockets and spacecraft that carry humans and cargo to space. From SpaceX's Falcon 9 to NASA's SLS, learn about the vehicles pushing the boundaries of exploration.

## Mission Status: ACTIVE

Your journey through the cosmos starts now. Select a mission from the navigation above and begin your exploration!

*Ad astra per aspera* - To the stars through difficulties.
    `.trim(),
  },
  {
    slug: 'understanding-rocket-propulsion',
    title: 'Understanding Rocket Propulsion: How Rockets Work',
    date: '2025-01-03',
    summary: 'Ever wondered how rockets escape Earth\'s gravity? Learn the basics of rocket propulsion and Newton\'s Third Law in action.',
    tags: ['education', 'rockets', 'physics'],
    coverImage: null,
    content: `
# Understanding Rocket Propulsion

Rockets are the only vehicles capable of traveling to space. But how do they work? Let's explore the science behind rocket propulsion.

## Newton's Third Law

The fundamental principle behind rocket propulsion is Newton's Third Law of Motion:

> "For every action, there is an equal and opposite reaction."

When a rocket expels hot gases downward at high speed, the rocket is pushed upward with equal force. This is called thrust.

## The Rocket Equation

The Tsiolkovsky rocket equation tells us how much a rocket can change its velocity based on:
- The exhaust velocity of the propellant
- The ratio of initial mass to final mass

This is why rockets need so much fuel - most of a rocket's mass at launch is propellant!

## Types of Rocket Engines

### Liquid Fuel Engines
- Use liquid propellants (like liquid hydrogen and liquid oxygen)
- Can be throttled and restarted
- Used by: SpaceX Falcon 9, NASA SLS

### Solid Fuel Engines
- Use pre-mixed solid propellant
- Simpler but cannot be shut down once ignited
- Used by: Space Shuttle boosters, many military rockets

### Hybrid Engines
- Combine solid fuel with liquid oxidizer
- Used by: Virgin Galactic SpaceShipTwo

## Escape Velocity

To leave Earth's gravitational pull, a rocket must reach escape velocity: approximately 11.2 km/s (25,000 mph). That's fast enough to travel from New York to Los Angeles in about 6 minutes!

## The Future: Reusable Rockets

Companies like SpaceX have revolutionized spaceflight by landing and reusing rocket boosters. This dramatically reduces the cost of reaching space and makes missions more sustainable.

Keep exploring, Junior Science Officers!
    `.trim(),
  },
  {
    slug: 'mars-perseverance-mission-update',
    title: 'Mars Perseverance: Searching for Ancient Life',
    date: '2025-01-01',
    summary: 'NASA\'s Perseverance rover continues its mission in Jezero Crater, collecting samples that may contain evidence of ancient Martian life.',
    tags: ['mars', 'nasa', 'missions'],
    coverImage: null,
    content: `
# Mars Perseverance: Searching for Ancient Life

NASA's Perseverance rover has been exploring Mars since February 2021, and its discoveries continue to amaze scientists around the world.

## Mission Overview

Perseverance landed in Jezero Crater, an ancient lake bed that scientists believe may have once harbored life. The rover's primary mission is to:

1. Search for signs of ancient microbial life
2. Collect rock and soil samples for future return to Earth
3. Test technologies for future human exploration

## Key Discoveries

### Ancient River Delta
Perseverance has confirmed that Jezero Crater was indeed an ancient lake, fed by a river that created a delta. This is exactly the kind of environment where life could have thrived billions of years ago.

### Organic Molecules
The rover has detected organic molecules in Martian rocks. While not proof of life, these molecules are the building blocks that life needs to exist.

### Sample Collection
Perseverance has collected dozens of rock core samples, sealed in special tubes, and deposited them on the Martian surface. A future mission will retrieve these samples and bring them back to Earth for detailed analysis.

## Ingenuity: The Mars Helicopter

Perseverance brought along a small helicopter named Ingenuity. Originally planned for just 5 flights, Ingenuity has completed over 70 flights, proving that powered flight is possible on Mars!

## What's Next?

The samples collected by Perseverance could answer one of humanity's biggest questions: Are we alone in the universe? When these samples return to Earth (planned for the 2030s), scientists will have the best chance ever to find evidence of past Martian life.

Stay tuned for more updates from the Red Planet!
    `.trim(),
  },
  {
    slug: 'exoplanets-how-we-find-them',
    title: 'Exoplanets: How We Find Worlds Around Other Stars',
    date: '2024-12-28',
    summary: 'Scientists have discovered over 5,000 exoplanets. Learn about the clever techniques used to detect these distant worlds.',
    tags: ['exoplanets', 'education', 'astronomy'],
    coverImage: null,
    content: `
# Exoplanets: How We Find Worlds Around Other Stars

Exoplanets are planets that orbit stars other than our Sun. Since the first confirmed discovery in 1992, scientists have found over 5,000 of these distant worlds. But how do we detect planets that are light-years away?

## The Transit Method

The most successful technique is the transit method. When a planet passes in front of its star (from our perspective), it blocks a tiny amount of starlight. By measuring this dimming, we can:

- Confirm a planet exists
- Calculate its size
- Determine its orbital period

NASA's Kepler and TESS missions have discovered thousands of exoplanets using this method.

## Radial Velocity (The Wobble Method)

Planets don't just orbit stars - they also cause stars to wobble slightly due to gravitational pull. By measuring the Doppler shift in a star's light, we can detect this wobble and calculate:

- The planet's minimum mass
- Its orbital period
- The shape of its orbit

## Direct Imaging

Sometimes we can actually photograph exoplanets! This is extremely difficult because stars are billions of times brighter than planets. Special instruments called coronagraphs block the star's light, allowing us to see planets directly.

## Gravitational Microlensing

When a star with planets passes in front of a more distant star, its gravity acts like a lens, magnifying the background star's light. Planets around the foreground star create additional blips in the light curve.

## The Habitable Zone

Scientists are especially interested in planets in the "habitable zone" - the region around a star where liquid water could exist on a planet's surface. These are the best candidates for potentially hosting life.

## Notable Exoplanets

- **Proxima Centauri b**: The closest known exoplanet, just 4.2 light-years away
- **TRAPPIST-1 system**: Seven Earth-sized planets, three in the habitable zone
- **Kepler-452b**: Often called "Earth's cousin" - similar size and in habitable zone

The search continues, and with new telescopes like the James Webb Space Telescope, we're discovering more about these distant worlds every day!
    `.trim(),
  },
  {
    slug: 'artemis-program-return-to-moon',
    title: 'Artemis Program: Humanity\'s Return to the Moon',
    date: '2024-12-20',
    summary: 'NASA\'s Artemis program aims to land the first woman and first person of color on the Moon. Here\'s what you need to know.',
    tags: ['nasa', 'moon', 'artemis', 'missions'],
    coverImage: null,
    content: `
# Artemis Program: Humanity's Return to the Moon

More than 50 years after Apollo 17, NASA is returning humans to the Moon with the Artemis program. This time, we're going to stay.

## Program Goals

The Artemis program has ambitious objectives:

1. Land the first woman on the Moon
2. Land the first person of color on the Moon
3. Establish sustainable lunar exploration
4. Prepare for human missions to Mars

## The Vehicles

### Space Launch System (SLS)
The most powerful rocket ever built, SLS can lift 95 metric tons to low Earth orbit. It's designed specifically for deep space missions.

### Orion Spacecraft
Orion is the crew capsule that will carry astronauts to lunar orbit and back. It's equipped with life support systems for missions lasting up to 21 days.

### Human Landing System (HLS)
SpaceX's Starship has been selected to land astronauts on the lunar surface. This massive spacecraft will be pre-positioned in lunar orbit.

### Gateway
A small space station in lunar orbit, Gateway will serve as a staging point for lunar surface missions and deep space exploration.

## Mission Timeline

- **Artemis I** (2022): Uncrewed test flight around the Moon ✓
- **Artemis II** (2025): Crewed flight around the Moon
- **Artemis III** (2026+): First crewed lunar landing since 1972

## Why Return to the Moon?

### Science
The Moon holds clues about the early solar system and Earth's history. The lunar south pole, where Artemis will land, may contain water ice in permanently shadowed craters.

### Technology Testing
The Moon is the perfect proving ground for technologies needed for Mars missions, including habitats, rovers, and resource utilization.

### Inspiration
Artemis will inspire a new generation of scientists, engineers, and explorers - including you, Junior Science Officers!

## Get Involved

Follow the Artemis missions and watch history being made. The next giant leap for humanity is just around the corner!
    `.trim(),
  },
]

export function getAllPosts() {
  return BLOG_POSTS.map(({ content, ...post }) => post).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )
}

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug) || null
}

export function getPostsByTag(tag) {
  return BLOG_POSTS.filter((post) => post.tags.includes(tag)).map(
    ({ content, ...post }) => post
  )
}

export function getAllTags() {
  const tags = new Set()
  BLOG_POSTS.forEach((post) => post.tags.forEach((tag) => tags.add(tag)))
  return Array.from(tags).sort()
}
