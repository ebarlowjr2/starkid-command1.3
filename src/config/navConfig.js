// src/config/navConfig.js
// Navigation configuration for the 4 main categories

export const navSections = [
  {
    label: 'Live',
    color: 'green',
    items: [
      { label: 'Command Center', to: '/command' },
      { label: 'Live Streams', to: '/updates/live' },
      { label: 'Artemis Mission', to: '/missions/artemis' }
    ]
  },
  {
    label: 'Sky',
    color: 'cyan',
    items: [
      { label: 'Sky Events', to: '/sky-events' },
      { label: "Tonight's Mission", to: '/tonights-mission' },
      { label: 'Comet Tracker', to: '/comets' },
      { label: '3D Solar Map', to: '/solar-map' }
    ]
  },
  {
    label: 'Explore',
    color: 'purple',
    items: [
      { label: 'Planets', to: '/planets' },
      { label: 'Beyond Solar System', to: '/beyond' },
      { label: 'Rocket Science', to: '/rockets' }
    ]
  },
  {
    label: 'Updates',
    color: 'orange',
    items: [
      { label: 'Updates Hub', to: '/updates' },
      { label: 'Official Updates', to: '/updates/official' },
      { label: 'News', to: '/updates/news' },
      { label: 'Blog', to: '/updates/blog' }
    ]
  }
]
