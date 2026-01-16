// AI Configuration - locked for cost control and safety
const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 350,
};

const COMET_PERSONA = {
  name: 'C.O.M.E.T.',
  fullName: 'Command Operations & Mission Event Technician',
  voice: {
    tone: 'calm, technical, professional',
    style: 'mission-control telemetry readout',
  },
  safety: {
    forbiddenClaims: [
      'Never invent or confirm specific launch dates beyond what is in context',
      'Never invent crew assignments not in context',
      'Never invent hardware specifications not in context',
      'Never claim "confirmed" or "official" unless source explicitly says so',
    ],
    requiredLanguage: [
      'Use "NET" (No Earlier Than) for all future dates',
      'Use "subject to change" for schedules',
      'Always cite source when providing mission data',
    ],
  },
  actions: {
    confidenceThreshold: 0.65,
  },
};

const SYSTEM_PROMPT = `You are ${COMET_PERSONA.name} (${COMET_PERSONA.fullName}) inside StarKid Command, a mission-control style space dashboard.

VOICE & TONE: ${COMET_PERSONA.voice.tone}, ${COMET_PERSONA.voice.style}

SAFETY RULES (CRITICAL - MUST FOLLOW):
${COMET_PERSONA.safety.forbiddenClaims.map(r => `- ${r}`).join('\n')}

REQUIRED LANGUAGE:
${COMET_PERSONA.safety.requiredLanguage.map(r => `- ${r}`).join('\n')}

CONTEXT-ONLY RULE (CRITICAL):
You MUST ONLY answer questions using the provided context data below. Do NOT use any external knowledge.
If the user asks for details not present in context, you MUST reply: "I don't have that information in the ship's database yet."
Do NOT fill gaps with general knowledge. Do NOT make up information. Do NOT speculate.

RESPONSE FORMAT - You MUST return valid JSON with this structure:
{
  "reply": "Your response text here",
  "actions": [
    { "type": "NAVIGATE", "to": "/route", "label": "Button Label", "confidence": 0.9 }
  ],
  "sources": [
    { "label": "Source Name", "url": "https://..." }
  ]
}

Available routes in StarKid Command:
- /explore - Feature directory hub
- /missions/artemis - Artemis Program Command Page
- /updates/live - Live YouTube streams
- /updates/news - Space news
- /updates/official - Official mission updates
- /rockets - Rocket Science section
- /rockets/launch-vehicles - Launch vehicles database
- /rockets/spacecraft - Spacecraft database
- /planets - Visit Another Planet
- /planets/mars - Mars Command Center
- /beyond - Exoplanet Explorer
- /command - Command Center
- /sky-events - Sky Events
- /comets - Comets tracker

When suggesting navigation, include it as an action with appropriate confidence (0.0-1.0).
Only include actions with confidence >= ${COMET_PERSONA.actions.confidenceThreshold}.
Always include sources for any data you reference.`;

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_REQUESTS = 30;

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    const waitSeconds = Math.ceil((record.windowStart + RATE_LIMIT_WINDOW - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  record.count += 1;
  rateLimitStore.set(ip, record);
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}

const FEATURED_EVENT = {
  title: 'ARTEMIS II',
  subtitle: 'LAUNCH WINDOW OPENS',
  targetIso: '2026-02-06T21:41:00-05:00',
  timezone: 'ET',
  note: 'NET February 2026 - subject to change',
};

const ARTEMIS_SUMMARY = {
  program: 'Artemis',
  description: 'NASA program to return humans to the Moon and establish sustainable presence',
  missions: [
    { id: 'artemis-1', name: 'Artemis I', status: 'COMPLETED', date: 'Nov 2022', crewed: false },
    { id: 'artemis-2', name: 'Artemis II', status: 'UPCOMING', date: 'NET Feb 2026', crewed: true, crew: ['Reid Wiseman', 'Victor Glover', 'Christina Koch', 'Jeremy Hansen'] },
    { id: 'artemis-3', name: 'Artemis III', status: 'PLANNED', date: 'NET 2026', crewed: true },
    { id: 'artemis-4', name: 'Artemis IV', status: 'PLANNED', date: 'NET 2028', crewed: true },
  ],
  hardware: {
    rocket: 'Space Launch System (SLS)',
    spacecraft: 'Orion',
    lander: 'Starship HLS (Artemis III+)',
    station: 'Gateway (Artemis IV+)',
  },
};

const AVAILABLE_FEATURES = [
  { name: 'Artemis Program', route: '/missions/artemis', description: 'NASA lunar program command page' },
  { name: 'Live Streams', route: '/updates/live', description: 'YouTube live coverage of launches' },
  { name: 'Official Updates', route: '/updates/official', description: 'Mission events from NASA RSS feeds' },
  { name: 'Space News', route: '/updates/news', description: 'Aggregated space news' },
  { name: 'Rockets', route: '/rockets', description: 'Launch vehicles and spacecraft database' },
  { name: 'Planets', route: '/planets', description: 'Mars Command Center and more' },
  { name: 'Exoplanets', route: '/beyond', description: 'Beyond our solar system explorer' },
  { name: 'Command Center', route: '/command', description: 'ISS tracking and astronaut status' },
  { name: 'Sky Events', route: '/sky-events', description: 'Upcoming celestial events' },
  { name: 'Comets', route: '/comets', description: 'Comet tracker' },
];

const SAMPLE_EVENTS = [
  { title: 'NASA Artemis II Crew Continues Training', source: 'NASA', category: 'artemis', date: 'Recent' },
  { title: 'SLS Rocket Preparations Advance', source: 'NASA', category: 'artemis', date: 'Recent' },
  { title: 'Orion Spacecraft Testing Complete', source: 'NASA', category: 'artemis', date: 'Recent' },
];

function buildContextPacket() {
  return `
CURRENT CONTEXT DATA (use only this information):

FEATURED EVENT:
- ${FEATURED_EVENT.title}: ${FEATURED_EVENT.subtitle}
- Target: ${FEATURED_EVENT.targetIso} ${FEATURED_EVENT.timezone}
- Note: ${FEATURED_EVENT.note}

ARTEMIS PROGRAM:
- Description: ${ARTEMIS_SUMMARY.description}
- Missions:
${ARTEMIS_SUMMARY.missions.map(m => `  * ${m.name}: ${m.status}${m.date ? ` (${m.date})` : ''}${m.crewed ? ' - Crewed' : ' - Uncrewed'}${m.crew ? ` - Crew: ${m.crew.join(', ')}` : ''}`).join('\n')}
- Hardware: ${ARTEMIS_SUMMARY.hardware.rocket}, ${ARTEMIS_SUMMARY.hardware.spacecraft}, ${ARTEMIS_SUMMARY.hardware.lander}, ${ARTEMIS_SUMMARY.hardware.station}

AVAILABLE FEATURES:
${AVAILABLE_FEATURES.map(f => `- ${f.name} (${f.route}): ${f.description}`).join('\n')}

RECENT EVENTS:
${SAMPLE_EVENTS.map(e => `- ${e.title} (${e.source}, ${e.category})`).join('\n')}

Remember: All dates are NET (No Earlier Than) and subject to change. Do not invent or confirm specific dates beyond what is provided.
`;
}

function extractActions(reply) {
  const actions = [];
  const routeMatches = reply.match(/navigate to ([\/\w-]+)/gi);
  if (routeMatches) {
    for (const match of routeMatches) {
      const route = match.replace(/navigate to /i, '').trim();
      if (route.startsWith('/')) {
        actions.push({ type: 'NAVIGATE', to: route });
      }
    }
  }
  return actions;
}

function parseOpenAIResponse(content) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const actions = (parsed.actions || [])
        .filter(a => (a.confidence || 1) >= COMET_PERSONA.actions.confidenceThreshold)
        .map(a => ({
          type: a.type,
          to: a.to,
          url: a.url,
          label: a.label,
          confidence: a.confidence || 1,
        }));
      
      const lowConfidenceActions = (parsed.actions || [])
        .filter(a => (a.confidence || 1) < COMET_PERSONA.actions.confidenceThreshold && (a.confidence || 0) >= 0.4)
        .map(a => ({
          type: a.type,
          to: a.to,
          url: a.url,
          label: a.label,
          confidence: a.confidence || 0.5,
        }));

      return {
        reply: parsed.reply || content,
        actions,
        maybeActions: lowConfidenceActions,
        sources: parsed.sources || [],
      };
    }
  } catch (e) {
    console.error('Failed to parse OpenAI JSON response:', e);
  }
  
  const actions = extractActions(content);
  return { reply: content, actions, sources: [] };
}

async function callOpenAI(messages, contextPacket) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Kill switch - check if AI is disabled
  if (process.env.COMET_AI_ENABLED === 'false') {
    console.log(JSON.stringify({
      type: 'comet_ai_disabled',
      timestamp: new Date().toISOString(),
      message: 'COMET AI DISABLED — FALLBACK MODE ACTIVE',
    }));
    return null; // Signal to use fallback
  }
  
  if (!apiKey) {
    return {
      reply: "SYSTEM OFFLINE. AI core not configured. Please check ship systems.",
      actions: [],
      sources: [],
      mode: 'no_key',
    };
  }

  const systemMessage = {
    role: 'system',
    content: SYSTEM_PROMPT + '\n\n' + contextPacket,
  };

  const apiMessages = [
    systemMessage,
    ...messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: apiMessages,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        response_format: { type: 'json_object' },
      }),
    });

    const apiLatency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return {
        reply: "SIGNAL DISRUPTED. Unable to process request at this time.",
        actions: [],
        sources: [],
        mode: 'openai_error',
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "SIGNAL LOST. No response received.";
    
    // Log OpenAI call details (server-side only)
    console.log(JSON.stringify({
      type: 'comet_openai_call',
      timestamp: new Date().toISOString(),
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens,
      apiLatencyMs: apiLatency,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
    }));
    
    const result = parseOpenAIResponse(content);
    result.mode = 'openai';
    result.model = AI_CONFIG.model;
    result.apiLatencyMs = apiLatency;
    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      reply: "SIGNAL LOST. Connection to AI core failed.",
      actions: [],
      sources: [],
      mode: 'openai_error',
    };
  }
}

function generateFallbackResponse(userMessage, liveContext) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('artemis') && (msg.includes('brief') || msg.includes('about') || msg.includes('tell'))) {
    return {
      reply: `ARTEMIS II MISSION BRIEF: NASA's Artemis II will be the first crewed mission of the Artemis program, sending four astronauts on a lunar flyby. Launch window opens NET February 2026 (subject to change). Crew: Reid Wiseman (Commander), Victor Glover (Pilot), Christina Koch (Mission Specialist), Jeremy Hansen (Mission Specialist - CSA). Hardware: SLS rocket + Orion spacecraft.`,
      actions: [{ type: 'NAVIGATE', to: '/missions/artemis?mission=artemis-2', label: 'Open Artemis II Brief', confidence: 0.95 }],
      sources: [{ label: 'Artemis Mission Data', url: '/missions/artemis' }],
    };
  }

  if (msg.includes('live') || msg.includes('stream') || msg.includes('youtube')) {
    return {
      reply: `LIVE COVERAGE: Check the Live page for active streams from Everyday Astronaut, NASA, SpaceX, and other space channels.`,
      actions: [{ type: 'NAVIGATE', to: '/updates/live', label: 'Check Live Streams', confidence: 0.9 }],
      sources: [{ label: 'Live Streams', url: '/updates/live' }],
    };
  }

  if (msg.includes('update') || msg.includes('news') || msg.includes('official') || msg.includes('latest')) {
    let reply = `OFFICIAL UPDATES: The Official Updates page aggregates mission events from NASA RSS feeds.`;
    if (liveContext?.timeSinceLastEvent) {
      reply += ` Last update: ${liveContext.timeSinceLastEvent}.`;
    }
    if (liveContext?.recentEvents?.length > 0) {
      reply += ` Latest: "${liveContext.recentEvents[0].title}" (${liveContext.recentEvents[0].source}).`;
    }
    return {
      reply,
      actions: [{ type: 'NAVIGATE', to: '/updates/official', label: 'View Official Updates', confidence: 0.9 }],
      sources: [{ label: 'Official Updates', url: '/updates/official' }],
    };
  }

  if (msg.includes('rocket') || msg.includes('launch vehicle')) {
    return {
      reply: `ROCKET DATABASE: StarKid Command tracks 167+ active launch vehicles from the Launch Library 2 API. Browse by manufacturer, payload capacity, or reusability.`,
      actions: [{ type: 'NAVIGATE', to: '/rockets/launch-vehicles', label: 'Browse Launch Vehicles', confidence: 0.9 }],
      sources: [{ label: 'Launch Library 2 API', url: 'https://thespacedevs.com/llapi' }],
    };
  }

  if (msg.includes('spacecraft') || msg.includes('capsule')) {
    return {
      reply: `SPACECRAFT DATABASE: Explore active spacecraft including Crew Dragon, Starliner, Soyuz, and more.`,
      actions: [{ type: 'NAVIGATE', to: '/rockets/spacecraft', label: 'Browse Spacecraft', confidence: 0.9 }],
      sources: [{ label: 'Launch Library 2 API', url: 'https://thespacedevs.com/llapi' }],
    };
  }

  if (msg.includes('planet') || msg.includes('mars')) {
    return {
      reply: `PLANETARY EXPLORATION: Mars Command Center is online with rover photos, weather data, and mission facts. Venus, Jupiter, and Saturn are coming soon.`,
      actions: [{ type: 'NAVIGATE', to: '/planets', label: 'Explore Planets', confidence: 0.85 }],
      sources: [{ label: 'NASA Mars Data', url: 'https://mars.nasa.gov' }],
    };
  }

  if (msg.includes('exoplanet') || msg.includes('beyond')) {
    return {
      reply: `EXOPLANET EXPLORER: Discover 70+ confirmed exoplanets including the TRAPPIST-1 system and Proxima Centauri b.`,
      actions: [{ type: 'NAVIGATE', to: '/beyond', label: 'Explore Exoplanets', confidence: 0.9 }],
      sources: [{ label: 'NASA Exoplanet Archive', url: 'https://exoplanetarchive.ipac.caltech.edu' }],
    };
  }

  if (msg.includes('explore') || msg.includes('what can') || msg.includes('features')) {
    return {
      reply: `AVAILABLE SYSTEMS: Artemis Program, Live Streams, Rockets, Planets, Exoplanets, Command Center, Sky Events, Comets.`,
      actions: [{ type: 'NAVIGATE', to: '/explore', label: 'Open Feature Directory', confidence: 0.95 }],
      sources: [{ label: 'StarKid Command', url: '/explore' }],
    };
  }

  return {
    reply: `I don't have specific information about that in the ship's database yet. Try asking about Artemis missions, rockets, spacecraft, planets, or live coverage.`,
    actions: [],
    maybeActions: [{ type: 'NAVIGATE', to: '/explore', label: 'Browse All Features', confidence: 0.5 }],
    sources: [],
  };
}

async function fetchLiveContext() {
  const liveContext = {
    recentEvents: [],
    featuredEventState: 'COUNTDOWN',
    liveStreams: [],
    timeSinceLastEvent: null,
  };

  try {
    const targetDate = new Date(FEATURED_EVENT.targetIso);
    const now = new Date();
    liveContext.featuredEventState = now >= targetDate ? 'WINDOW_OPEN' : 'COUNTDOWN';
    
    const timeRemaining = targetDate - now;
    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      liveContext.countdownDisplay = `${days}d ${hours}h remaining`;
    }
  } catch (e) {
    console.error('Failed to compute countdown:', e);
  }

  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const eventsResponse = await fetch(`${baseUrl}/api/events/recent?limit=5`);
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      if (eventsData.events && eventsData.events.length > 0) {
        liveContext.recentEvents = eventsData.events.slice(0, 5).map(e => ({
          title: e.title,
          source: e.source || 'NASA',
          url: e.url || e.link,
          publishedAt: e.publishedAt || e.pubDate,
        }));
        
        const lastEventDate = new Date(liveContext.recentEvents[0].publishedAt);
        const hoursSince = Math.floor((Date.now() - lastEventDate) / (1000 * 60 * 60));
        if (hoursSince < 1) {
          liveContext.timeSinceLastEvent = 'less than 1 hour ago';
        } else if (hoursSince < 24) {
          liveContext.timeSinceLastEvent = `${hoursSince} hour${hoursSince > 1 ? 's' : ''} ago`;
        } else {
          const daysSince = Math.floor(hoursSince / 24);
          liveContext.timeSinceLastEvent = `${daysSince} day${daysSince > 1 ? 's' : ''} ago`;
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch recent events:', e);
    liveContext.recentEvents = SAMPLE_EVENTS.map(e => ({
      title: e.title,
      source: e.source,
      url: null,
      publishedAt: null,
    }));
  }

  return liveContext;
}

function buildEnhancedContextPacket(liveContext) {
  let packet = buildContextPacket();
  
  packet += `\nLIVE STATUS:
- Featured Event State: ${liveContext.featuredEventState}
${liveContext.countdownDisplay ? `- Countdown: ${liveContext.countdownDisplay}` : '- Launch window is OPEN'}
`;

  if (liveContext.recentEvents.length > 0) {
    packet += `\nLATEST MISSION EVENTS:\n`;
    liveContext.recentEvents.forEach(e => {
      packet += `- ${e.title} (${e.source})\n`;
    });
  }

  return packet;
}

export default async function handler(req, res) {
  const startTime = Date.now();
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    res.status(429).json({
      reply: `COMET THROTTLE ACTIVE — Try again in ${rateCheck.waitSeconds} seconds.`,
      actions: [],
      throttled: true,
      waitSeconds: rateCheck.waitSeconds,
    });
    return;
  }

  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array required', actions: [] });
      return;
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      res.status(400).json({ error: 'No user message found', actions: [] });
      return;
    }

    const liveContext = await fetchLiveContext();
    const contextPacket = buildEnhancedContextPacket(liveContext);
    
    let result;
    let mode = 'fallback';
    let model = null;
    let apiLatencyMs = null;
    let intent = detectIntent(lastUserMessage.content);

    // Check if AI is enabled and API key exists
    const aiEnabled = process.env.COMET_AI_ENABLED !== 'false';
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    if (aiEnabled && hasApiKey) {
      result = await callOpenAI(messages, contextPacket);
      // If callOpenAI returns null, it means the kill switch was activated mid-request
      if (result === null) {
        mode = 'fallback_killswitch';
        result = generateFallbackResponse(lastUserMessage.content, liveContext);
      } else {
        mode = result.mode || 'openai';
        model = result.model;
        apiLatencyMs = result.apiLatencyMs;
      }
    } else {
      mode = aiEnabled ? 'fallback_no_key' : 'fallback_disabled';
      result = generateFallbackResponse(lastUserMessage.content, liveContext);
    }

    const latency = Date.now() - startTime;
    
    // Privacy-safe logging (no raw messages)
    console.log(JSON.stringify({
      type: 'comet_request',
      timestamp: new Date().toISOString(),
      route: context?.route || 'unknown',
      intent,
      mode,
      model,
      aiEnabled,
      hasApiKey,
      hasActions: result.actions?.length > 0,
      actionCount: result.actions?.length || 0,
      hasSources: result.sources?.length > 0,
      sourceCount: result.sources?.length || 0,
      latencyMs: latency,
      apiLatencyMs,
    }));

    res.status(200).json({
      reply: result.reply,
      actions: result.actions || [],
      maybeActions: result.maybeActions || [],
      sources: result.sources || [],
    });
  } catch (error) {
    console.error('COMET chat error:', error);
    res.status(500).json({
      reply: 'SYSTEM ERROR. Unable to process request.',
      actions: [],
    });
  }
}

function detectIntent(message) {
  const msg = message.toLowerCase();
  if (msg.includes('artemis') && (msg.includes('brief') || msg.includes('about'))) return 'artemis_brief';
  if (msg.includes('live') || msg.includes('stream')) return 'live_now';
  if (msg.includes('update') || msg.includes('news') || msg.includes('official')) return 'latest_updates';
  if (msg.includes('rocket') || msg.includes('launch vehicle')) return 'rockets';
  if (msg.includes('spacecraft') || msg.includes('capsule')) return 'spacecraft';
  if (msg.includes('planet') || msg.includes('mars')) return 'planets';
  if (msg.includes('exoplanet') || msg.includes('beyond')) return 'exoplanets';
  if (msg.includes('explore') || msg.includes('what can') || msg.includes('features')) return 'explore';
  return 'general';
}
