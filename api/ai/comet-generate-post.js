const SYSTEM_PROMPT = `You are C.O.M.E.T. (Command Operations & Mission Event Technician) generating social media posts for StarKid Command.

Rules for drafting posts:
1. Must mention the source (NASA/ESA/etc.) in the text
2. Must not claim confirmation beyond what the event says
3. Must link to the original event URL if available
4. Use professional, enthusiast-friendly tone
5. Include relevant hashtags sparingly
6. Never invent dates, specs, or details not in the source

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
  
  if (!apiKey) {
    return generateFallbackDrafts(event);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error');
      return generateFallbackDrafts(event);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const variants = JSON.parse(jsonMatch[0]);
        return variants.map((v, idx) => ({
          id: `draft-${Date.now()}-${idx}`,
          platform: 'x',
          eventId: event.id,
          status: 'DRAFT',
          variant: v.variant,
          content: v.content,
          createdAt: new Date().toISOString(),
        }));
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
    }

    return generateFallbackDrafts(event);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateFallbackDrafts(event);
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
    const { eventId } = req.body;

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

    const drafts = await generateWithOpenAI(event);

    draftsStore = [...drafts, ...draftsStore].slice(0, 100);

    res.status(200).json({
      success: true,
      draftsCreated: drafts.length,
      drafts,
    });
  } catch (error) {
    console.error('Generate post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate drafts',
    });
  }
}
