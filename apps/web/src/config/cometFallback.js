export const COMET_INTENTS = {
  artemis_brief: {
    patterns: ['artemis', 'brief', 'about artemis', 'tell me about artemis'],
    response: {
      reply: `ARTEMIS II MISSION BRIEF: NASA's Artemis II will be the first crewed mission of the Artemis program, sending four astronauts on a lunar flyby. Launch window opens NET February 2026 (subject to change). Crew: Reid Wiseman (Commander), Victor Glover (Pilot), Christina Koch (Mission Specialist), Jeremy Hansen (Mission Specialist - CSA). Hardware: SLS rocket + Orion spacecraft. Navigate to /missions/artemis for full mission control dashboard.`,
      actions: [{ type: 'NAVIGATE', to: '/missions/artemis?mission=artemis-2', label: 'Open Artemis II Brief' }],
    },
    followUp: ['What rockets are used?', 'Who is the crew?'],
  },
  live_now: {
    patterns: ['live', 'stream', 'youtube', 'broadcasting', 'watching'],
    response: {
      reply: `LIVE COVERAGE: Check the Live page for active streams from Everyday Astronaut, NASA, SpaceX, and other space channels. Navigate to /updates/live to see what's broadcasting now.`,
      actions: [{ type: 'NAVIGATE', to: '/updates/live', label: 'Check Live Streams' }],
    },
    followUp: ['Any launches today?', 'Show me NASA TV'],
  },
  latest_updates: {
    patterns: ['update', 'news', 'official', 'latest', 'recent'],
    response: {
      reply: `OFFICIAL UPDATES: The Official Updates page aggregates mission events from NASA RSS feeds. Navigate to /updates/official for the latest. For broader space news, check /updates/news.`,
      actions: [{ type: 'NAVIGATE', to: '/updates/official', label: 'View Official Updates' }],
    },
    followUp: ['Any Artemis news?', 'Show me space news'],
  },
  rockets: {
    patterns: ['rocket', 'launch vehicle', 'falcon', 'sls', 'starship'],
    response: {
      reply: `ROCKET DATABASE: StarKid Command tracks 167+ active launch vehicles from the Launch Library 2 API. Browse by manufacturer, payload capacity, or reusability. Navigate to /rockets/launch-vehicles to explore.`,
      actions: [{ type: 'NAVIGATE', to: '/rockets/launch-vehicles', label: 'Explore Rockets' }],
    },
    followUp: ['Show me SpaceX rockets', 'What about spacecraft?'],
  },
  spacecraft: {
    patterns: ['spacecraft', 'capsule', 'dragon', 'orion', 'starliner'],
    response: {
      reply: `SPACECRAFT DATABASE: Explore active spacecraft including Crew Dragon, Starliner, Soyuz, and more. Navigate to /rockets/spacecraft for the full catalog.`,
      actions: [{ type: 'NAVIGATE', to: '/rockets/spacecraft', label: 'Explore Spacecraft' }],
    },
    followUp: ['Tell me about Orion', 'Show me Dragon'],
  },
  planets: {
    patterns: ['planet', 'mars', 'venus', 'jupiter', 'saturn'],
    response: {
      reply: `PLANETARY EXPLORATION: Mars Command Center is online with rover photos, weather data, and mission facts. Venus, Jupiter, and Saturn are coming soon. Navigate to /planets to explore.`,
      actions: [{ type: 'NAVIGATE', to: '/planets', label: 'Visit Planets' }],
    },
    followUp: ['Show me Mars', 'Any rover photos?'],
  },
  exoplanets: {
    patterns: ['exoplanet', 'beyond', 'trappist', 'proxima', 'kepler'],
    response: {
      reply: `EXOPLANET EXPLORER: Discover 70+ confirmed exoplanets including the TRAPPIST-1 system and Proxima Centauri b. Navigate to /beyond to explore worlds beyond our solar system.`,
      actions: [{ type: 'NAVIGATE', to: '/beyond', label: 'Explore Exoplanets' }],
    },
    followUp: ['Show me TRAPPIST-1', 'Any habitable planets?'],
  },
  explore: {
    patterns: ['explore', 'what can', 'features', 'help', 'what do you'],
    response: {
      reply: `AVAILABLE SYSTEMS: Artemis Program (/missions/artemis), Live Streams (/updates/live), Rockets (/rockets), Planets (/planets), Exoplanets (/beyond), Command Center (/command), Sky Events (/sky-events), Comets (/comets). Navigate to /explore for the full feature directory.`,
      actions: [{ type: 'NAVIGATE', to: '/explore', label: 'Open Feature Directory' }],
    },
    followUp: ['Tell me about Artemis', 'Show me rockets'],
  },
  general: {
    patterns: [],
    response: {
      reply: `I don't have specific information about that in the ship's database yet. Try asking about Artemis missions, rockets, spacecraft, planets, or live coverage. Navigate to /explore to see all available systems.`,
      actions: [],
    },
    followUp: ['What can you do?', 'Show me Artemis'],
  },
};

export function matchIntent(message) {
  const msg = message.toLowerCase();
  
  for (const [intentName, intent] of Object.entries(COMET_INTENTS)) {
    if (intentName === 'general') continue;
    
    for (const pattern of intent.patterns) {
      if (msg.includes(pattern)) {
        return intentName;
      }
    }
  }
  
  return 'general';
}

export function getFallbackResponse(message) {
  const intentName = matchIntent(message);
  const intent = COMET_INTENTS[intentName];
  
  return {
    ...intent.response,
    intent: intentName,
    followUp: intent.followUp,
  };
}
