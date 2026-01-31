// AI Configuration - locked for cost control and safety (same as comet-chat)
const AI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.4, // Slightly higher than chat for creative drafts, but still controlled
  maxTokens: 600,
};

const SYSTEM_PROMPT = `You are C.O.M.E.T. (Command Operations & Mission Event Technician) generating social media posts for StarKid Command.

STRICT RULES for drafting posts (MUST FOLLOW):
1. MUST mention the source (NASA/ESA/etc.) in the text - format as "Source: NASA" or "via NASA"
2. MUST NOT claim "confirmed" or "official" unless the source explicitly says so
3. MUST include the original event URL if available
4. If the event mentions "NET", "window", or "subject to change" - you MUST include that language
5. NEVER claim "launch confirmed" unless the source explicitly confirms it
6. Use professional, enthusiast-friendly tone
7. Include relevant hashtags sparingly (max 3)
8. Never invent dates, specs, or details not in the source
9. ONLY use information provided in the event data - do NOT add external knowledge

Generate 3 versions:
1. SHORT (under 100 chars) - Quick headline style
2. MEDIUM (under 200 chars) - More context
3. SHIP_VOICE (under 280 chars) - C.O.M.E.T. personality, mission-control style`;

const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    title: 'NASA Artemis II Crew Continues Training',
    source: 'NASA (News Releases)',
    url: 'https://www.nasa.gov/artemis-ii-training',
    summary: 'The four astronauts selected for the Artemis II mission continue their intensive training program.',
    category: 'artemis',
  },
  {
    id: 'sample-2',
    title: 'SLS Rocket Preparations Advance',
    source: 'NASA (Main Feed)',
    url: 'https://www.nasa.gov/sls-artemis-ii',
    summary: 'Engineers at Kennedy Space Center continue stacking and testing the Space Launch System rocket.',
    category: 'artemis',
  },
];

let draftsStore = [];
const processedEventIds = new Set();

function computeEventHash(event) {
  return `${event.id}-${event.title.slice(0, 50)}`;
}

function isDuplicateEvent(event) {
  const hash = computeEventHash(event);
  return processedEventIds.has(hash);
}

function markEventProcessed(event) {
  const hash = computeEventHash(event);
  processedEventIds.add(hash);
  if (processedEventIds.size > 1000) {
    const firstKey = processedEventIds.values().next().value;
    processedEventIds.delete(firstKey);
  }
}

function validateDraft(draft, event) {
  const issues = [];
  const content = draft.content.toLowerCase();
  
  const sourceTag = event.source.includes('NASA') ? 'nasa' : event.source.split(' ')[0].toLowerCase();
  if (!content.includes(sourceTag) && !content.includes('source:')) {
    issues.push('Missing source attribution');
  }
  
  if (event.url && !draft.content.includes(event.url) && draft.variant !== 'short') {
    issues.push('Missing source URL');
  }
  
  const eventText = (event.title + ' ' + event.summary).toLowerCase();
  const hasNETLanguage = eventText.includes('net') || eventText.includes('window') || eventText.includes('subject to change');
  if (hasNETLanguage && !content.includes('net') && !content.includes('window') && !content.includes('subject to change')) {
    issues.push('Missing NET/window language');
  }
  
  if (content.includes('confirmed') || content.includes('official')) {
    if (!eventText.includes('confirmed') && !eventText.includes('official')) {
      issues.push('Claims confirmation not in source');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

function fixDraft(draft, event) {
  let content = draft.content;
  const sourceTag = event.source.includes('NASA') ? 'NASA' : event.source.split(' ')[0];
  
  if (!content.toLowerCase().includes(sourceTag.toLowerCase()) && !content.toLowerCase().includes('source:')) {
    if (draft.variant === 'short') {
      content = content.replace(/\s*#/, ` via ${sourceTag} #`);
      if (!content.includes(sourceTag)) {
        content += ` via ${sourceTag}`;
      }
    } else {
      content += `\n\nSource: ${sourceTag}`;
    }
  }
  
  if (event.url && !content.includes(event.url) && draft.variant !== 'short') {
    content += `\n${event.url}`;
  }
  
  const eventText = (event.title + ' ' + event.summary).toLowerCase();
  const hasNETLanguage = eventText.includes('net') || eventText.includes('window') || eventText.includes('subject to change');
  if (hasNETLanguage && !content.toLowerCase().includes('net') && !content.toLowerCase().includes('window') && !content.toLowerCase().includes('subject to change')) {
    content = content.replace(/launch/gi, 'launch (NET)');
  }
  
  content = content.replace(/\bconfirmed\b/gi, 'reported');
  content = content.replace(/\bofficial\b/gi, 'announced');
  
  return { ...draft, content };
}

function generateFallbackDrafts(event) {
  const sourceTag = event.source.includes('NASA') ? 'NASA' : event.source.split(' ')[0];
  const hashtags = event.category === 'artemis' ? '#Artemis #NASA #Moon' : '#Space #NASA';
  
  return [
    {
      id: `draft-${Date.now()}-short`,
      platform: 'x',
      eventId: event.id,
      status: 'DRAFT',
      variant: 'short',
      content: `${event.title} via ${sourceTag} ${hashtags}`,
      createdAt: new Date().toISOString(),
    },
    {
      id: `draft-${Date.now()}-medium`,
      platform: 'x',
      eventId: event.id,
      status: 'DRAFT',
      variant: 'medium',
      content: `${event.title}\n\n${event.summary.slice(0, 100)}...\n\nSource: ${sourceTag}\n${event.url ? event.url : ''}\n${hashtags}`,
      createdAt: new Date().toISOString(),
    },
    {
      id: `draft-${Date.now()}-ship`,
      platform: 'x',
      eventId: event.id,
      status: 'DRAFT',
      variant: 'ship_voice',
      content: `SIGNAL RECEIVED: ${event.title}\n\nShip's log updated. ${event.summary.slice(0, 80)}...\n\nSource: ${sourceTag}\n${hashtags}`,
      createdAt: new Date().toISOString(),
    },
  ];
}

async function generateWithOpenAI(event) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Check kill switch
  if (process.env.COMET_AI_ENABLED === 'false') {
    console.log(JSON.stringify({
      type: 'comet_social_ai_disabled',
      timestamp: new Date().toISOString(),
      message: 'COMET AI DISABLED — Using fallback drafts',
    }));
    return { drafts: generateFallbackDrafts(event), mode: 'fallback_disabled' };
  }
  
  if (!apiKey) {
    return { drafts: generateFallbackDrafts(event), mode: 'fallback_no_key' };
  }

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
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Generate 3 social media post drafts for this event:

Title: ${event.title}
Source: ${event.source}
URL: ${event.url || 'N/A'}
Summary: ${event.summary}
Category: ${event.category}

Return as JSON array with format:
[
  { "variant": "short", "content": "..." },
  { "variant": "medium", "content": "..." },
  { "variant": "ship_voice", "content": "..." }
]`,
          },
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      }),
    });

    const apiLatency = Date.now() - startTime;

    if (!response.ok) {
      console.error('OpenAI API error');
      return { drafts: generateFallbackDrafts(event), mode: 'openai_error' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Log OpenAI call details (server-side only)
    console.log(JSON.stringify({
      type: 'comet_social_openai_call',
      timestamp: new Date().toISOString(),
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      maxTokens: AI_CONFIG.maxTokens,
      apiLatencyMs: apiLatency,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
      eventId: event.id,
    }));

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const variants = JSON.parse(jsonMatch[0]);
        const drafts = variants.map((v, idx) => ({
          id: `draft-${Date.now()}-${idx}`,
          platform: 'x',
          eventId: event.id,
          status: 'DRAFT',
          variant: v.variant,
          content: v.content,
          createdAt: new Date().toISOString(),
        }));
        return { drafts, mode: 'openai', apiLatencyMs: apiLatency };
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
    }

    return { drafts: generateFallbackDrafts(event), mode: 'openai_parse_error' };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { drafts: generateFallbackDrafts(event), mode: 'openai_error' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      drafts: draftsStore,
      count: draftsStore.length,
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

    try {
      const { eventId, forceDuplicate } = req.body;

      if (!eventId) {
        res.status(400).json({ error: 'eventId required' });
        return;
      }

      let event = SAMPLE_EVENTS.find((e) => e.id === eventId);

      if (!event) {
        event = {
          id: eventId,
          title: 'Mission Update',
          source: 'StarKid Command',
          url: '',
          summary: 'New mission event detected.',
          category: 'official',
        };
      }

      if (!forceDuplicate && isDuplicateEvent(event)) {
        res.status(200).json({
          success: false,
          error: 'DUPLICATE_EVENT',
          message: 'Drafts already generated for this event. Use forceDuplicate: true to override.',
          draftsCreated: 0,
          drafts: [],
        });
        return;
      }

      const result = await generateWithOpenAI(event);
      let drafts = result.drafts;
      const mode = result.mode;
      const apiLatencyMs = result.apiLatencyMs;

      // Apply guardrails: validate and fix all drafts
      drafts = drafts.map(draft => {
        const validation = validateDraft(draft, event);
        if (!validation.valid) {
          console.log(JSON.stringify({
            type: 'comet_social_draft_validation',
            timestamp: new Date().toISOString(),
            variant: draft.variant,
            issues: validation.issues,
            eventId: event.id,
          }));
          return fixDraft(draft, event);
        }
        return draft;
      });

      markEventProcessed(event);

      draftsStore = [...drafts, ...draftsStore].slice(0, 100);

      // Log draft generation summary
      console.log(JSON.stringify({
        type: 'comet_social_drafts_generated',
        timestamp: new Date().toISOString(),
        mode,
        eventId: event.id,
        draftsCreated: drafts.length,
        apiLatencyMs,
      }));

      res.status(200).json({
        success: true,
        draftsCreated: drafts.length,
        drafts,
        eventHash: computeEventHash(event),
        mode,
      });
    } catch (error) {
      console.error('Generate post error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate drafts',
      });
    }
}
