import { getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

export const CONTENT_TYPES = [
  'news',
  'artemis_update',
  'spacex_update',
  'launch_update',
  'new_space_company_update',
  'random_space_fact',
  'today_in_space',
  'stem_mission_companion',
  'app_update',
  'evergreen_stem',
]

export const AUTO_APPROVED_TYPES = [
  'news',
  'artemis_update',
  'spacex_update',
  'launch_update',
  'new_space_company_update',
]

export const REVIEW_REQUIRED_TYPES = [
  'random_space_fact',
  'today_in_space',
  'stem_mission_companion',
  'evergreen_stem',
  'app_update',
]

export const CONTENT_DISTRIBUTION_RULES = {
  news: {
    requiresReview: false,
    autoApprove: true,
    defaultPlatforms: ['facebook', 'linkedin', 'x'],
    publishToBlog: true,
    publishToApp: false,
  },
  artemis_update: {
    requiresReview: false,
    autoApprove: true,
    defaultPlatforms: ['instagram', 'facebook', 'linkedin', 'x'],
    publishToBlog: true,
    publishToApp: true,
  },
  spacex_update: {
    requiresReview: false,
    autoApprove: true,
    defaultPlatforms: ['instagram', 'facebook', 'x', 'threads'],
    publishToBlog: true,
    publishToApp: true,
  },
  launch_update: {
    requiresReview: false,
    autoApprove: true,
    defaultPlatforms: ['instagram', 'facebook', 'x'],
    publishToBlog: true,
    publishToApp: true,
  },
  new_space_company_update: {
    requiresReview: false,
    autoApprove: true,
    defaultPlatforms: ['linkedin', 'facebook', 'x'],
    publishToBlog: true,
    publishToApp: false,
  },
  random_space_fact: {
    requiresReview: true,
    autoApprove: false,
    defaultPlatforms: ['instagram', 'facebook', 'threads'],
    publishToBlog: true,
    publishToApp: true,
  },
  today_in_space: {
    requiresReview: true,
    autoApprove: false,
    defaultPlatforms: ['instagram', 'facebook', 'x', 'threads'],
    publishToBlog: true,
    publishToApp: true,
  },
  stem_mission_companion: {
    requiresReview: true,
    autoApprove: false,
    defaultPlatforms: ['facebook', 'linkedin', 'instagram'],
    publishToBlog: true,
    publishToApp: true,
  },
  evergreen_stem: {
    requiresReview: true,
    autoApprove: false,
    defaultPlatforms: ['facebook', 'linkedin', 'instagram'],
    publishToBlog: true,
    publishToApp: true,
  },
  app_update: {
    requiresReview: true,
    autoApprove: false,
    defaultPlatforms: ['facebook', 'linkedin', 'instagram', 'x'],
    publishToBlog: true,
    publishToApp: true,
  },
}

const memory = {
  items: [],
  socialPosts: [],
  appLinks: [],
  webhookEvents: [],
}

export function parseBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

export function setCors(res, methods = 'GET, POST, PATCH, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', methods)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OPS-KEY')
}

export function requireOps(req, res) {
  const opsKey = process.env.OPS_ACCESS_KEY
  if (!opsKey) return true
  if (req.headers['x-ops-key'] === opsKey) return true
  res.status(401).json({ error: 'OPS_ACCESS_REQUIRED' })
  return false
}

export function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function getDistributionRule(contentType) {
  return CONTENT_DISTRIBUTION_RULES[contentType] || {
    requiresReview: true,
    autoApprove: false,
    defaultPlatforms: ['facebook', 'linkedin'],
    publishToBlog: true,
    publishToApp: false,
  }
}

export function determineInitialStatus(contentType) {
  if (AUTO_APPROVED_TYPES.includes(contentType)) return 'approved'
  if (REVIEW_REQUIRED_TYPES.includes(contentType)) return 'needs_review'
  return 'needs_review'
}

export function canDistribute(item) {
  return item?.status === 'approved' || item?.status === 'scheduled'
}

export function canRetryWebhook(item) {
  return item?.status === 'failed' && Boolean(item.auto_approved || item.reviewed_at)
}

export function normalizeItem(input = {}) {
  const contentType = CONTENT_TYPES.includes(input.content_type) ? input.content_type : 'evergreen_stem'
  const rule = getDistributionRule(contentType)
  const title = String(input.title || 'Untitled StarKid Content').trim()
  return {
    content_type: contentType,
    status: input.status || determineInitialStatus(contentType),
    title,
    slug: input.slug || slugify(title),
    excerpt: input.excerpt || '',
    body: input.body || '',
    seo_title: input.seo_title || title,
    seo_description: input.seo_description || input.excerpt || '',
    hero_image_url: input.hero_image_url || '',
    stem_tie_in: input.stem_tie_in || '',
    app_cta: input.app_cta || '',
    source_name: input.source_name || '',
    source_url: input.source_url || '',
    source_published_at: input.source_published_at || null,
    fact_source_name: input.fact_source_name || '',
    fact_source_url: input.fact_source_url || '',
    verified_manually: Boolean(input.verified_manually),
    topic: input.topic || '',
    company: input.company || '',
    mission_name: input.mission_name || '',
    traffic_score: Number(input.traffic_score || 0),
    stem_score: Number(input.stem_score || 0),
    is_launch_related: Boolean(input.is_launch_related),
    is_lunar_related: Boolean(input.is_lunar_related),
    is_stem_related: Boolean(input.is_stem_related || input.stem_tie_in),
    is_test: Boolean(input.is_test),
    requires_review: rule.requiresReview,
    auto_approved: rule.autoApprove,
    scheduled_for: input.scheduled_for || null,
    rejection_reason: input.rejection_reason || '',
  }
}

export function validateForCreate(item) {
  const errors = []
  if (!item.title) errors.push('Title is required.')
  if (item.auto_approved && (!item.source_name || !item.source_url)) {
    errors.push('Auto-approved source-based content needs source name and source URL.')
  }
  return errors
}

export function validateForApproval(item) {
  if (!item.requires_review) return []
  if (item.fact_source_url || item.source_url || item.verified_manually) return []
  return ['Review-required educational content needs a source URL or manual verification before approval.']
}

export async function listContent(filter = 'all') {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    let query = supabase
      .from('content_items')
      .select('*, social_posts(*), content_app_links(*), content_webhook_events(*)')
      .order('created_at', { ascending: false })

    if (filter === 'candidates') query = query.eq('status', 'candidate')
    if (filter === 'review') query = query.eq('status', 'needs_review')
    if (filter === 'drafts') query = query.eq('status', 'draft')
    if (filter === 'scheduled') query = query.eq('status', 'scheduled')
    if (filter === 'published') query = query.eq('status', 'published')
    if (filter === 'social-queue') query = query.in('status', ['approved', 'scheduled', 'sent_to_buffer'])

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  return memory.items
    .filter((item) => {
      if (filter === 'all') return true
      if (filter === 'review') return item.status === 'needs_review'
      if (filter === 'drafts') return item.status === 'draft'
      if (filter === 'social-queue') return ['approved', 'scheduled', 'sent_to_buffer'].includes(item.status)
      return item.status === filter || item.status === filter.replace('-', '_')
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(hydrateMemoryItem)
}

export async function getContent(id) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('content_items')
      .select('*, social_posts(*), content_app_links(*), content_webhook_events(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  const item = memory.items.find((entry) => entry.id === id)
  return item ? hydrateMemoryItem(item) : null
}

export async function createContent(input) {
  const item = normalizeItem(input)
  const errors = validateForCreate(item)
  if (errors.length) {
    const error = new Error(errors.join(' '))
    error.status = 400
    throw error
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('content_items').insert(item).select('*').single()
    if (error) throw error
    if (input.app_link_type) {
      await upsertAppLink(data.id, input)
    }
    return getContent(data.id)
  }

  const now = new Date().toISOString()
  const record = {
    ...item,
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
  }
  memory.items.unshift(record)
  if (input.app_link_type) {
    memory.appLinks.push({
      id: crypto.randomUUID(),
      content_item_id: record.id,
      link_type: input.app_link_type,
      target_id: input.app_link_target_id || '',
      cta_text: input.app_cta || '',
      created_at: now,
    })
  }
  return hydrateMemoryItem(record)
}

export async function createSmokeTestItems() {
  const sourceDate = new Date().toISOString()
  const samples = [
    {
      content_type: 'spacex_update',
      title: 'TEST SpaceX Update',
      excerpt: 'Production smoke test for source-based SpaceX content.',
      body: 'This is a test SpaceX update for validating the StarKid Content Command Center workflow.',
      source_name: 'SpaceX',
      source_url: 'https://www.spacex.com/',
      source_published_at: sourceDate,
      stem_tie_in: 'Rocket launches demonstrate force, motion, thrust, and orbital mechanics.',
      app_cta: 'Track this mission in StarKid Command',
      app_link_type: 'mission_countdown',
      is_launch_related: true,
      is_stem_related: true,
      is_test: true,
      stem_score: 7,
      traffic_score: 8,
    },
    {
      content_type: 'artemis_update',
      title: 'TEST Artemis Update',
      excerpt: 'Production smoke test for source-based Artemis content.',
      body: 'This is a test Artemis update for validating lunar and mission countdown content workflows.',
      source_name: 'NASA',
      source_url: 'https://www.nasa.gov/humans-in-space/artemis/',
      source_published_at: sourceDate,
      stem_tie_in: 'Artemis connects lunar exploration to engineering, geology, and mission planning.',
      app_cta: 'Track this mission in StarKid Command',
      app_link_type: 'mission_countdown',
      is_lunar_related: true,
      is_stem_related: true,
      is_test: true,
      stem_score: 8,
      traffic_score: 8,
    },
    {
      content_type: 'random_space_fact',
      title: 'TEST Random Space Fact',
      excerpt: 'Production smoke test for review-required educational facts.',
      body: 'This is a test space fact used to confirm educational content stays locked until review.',
      fact_source_name: 'NASA Space Place',
      fact_source_url: 'https://spaceplace.nasa.gov/',
      stem_tie_in: 'Facts should teach one concrete STEM idea and cite a trusted source.',
      app_cta: 'Explore this STEM idea in StarKid Command',
      app_link_type: 'stem_module',
      is_stem_related: true,
      is_test: true,
      stem_score: 8,
      traffic_score: 4,
    },
    {
      content_type: 'today_in_space',
      title: 'TEST Today in Space',
      excerpt: 'Production smoke test for review-required Today in Space content.',
      body: 'This is a test Today in Space entry used to verify review and distribution guardrails.',
      fact_source_name: 'NASA History',
      fact_source_url: 'https://www.nasa.gov/history/',
      stem_tie_in: 'Historical space milestones can connect dates to science and engineering progress.',
      app_cta: 'Open today’s mission briefing in StarKid Command',
      app_link_type: 'app_alert',
      is_stem_related: true,
      is_test: true,
      stem_score: 7,
      traffic_score: 5,
    },
    {
      content_type: 'stem_mission_companion',
      title: 'TEST STEM Mission Companion',
      excerpt: 'Production smoke test for review-required STEM companion content.',
      body: 'This is a test STEM companion item used to verify app links, approval, and social export.',
      fact_source_name: 'NASA STEM Engagement',
      fact_source_url: 'https://www.nasa.gov/learning-resources/',
      stem_tie_in: 'Mission companion posts should turn space events into age-appropriate STEM learning.',
      app_cta: 'Try the linked STEM mission in StarKid Command',
      app_link_type: 'stem_module',
      is_launch_related: true,
      is_stem_related: true,
      is_test: true,
      stem_score: 9,
      traffic_score: 5,
    },
  ]

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const records = samples.map((sample, index) => normalizeItem({
      ...sample,
      slug: `${slugify(sample.title)}-${Date.now()}-${index + 1}`,
    }))

    const { data, error } = await supabase
      .from('content_items')
      .insert(records)
      .select('*')

    if (error) throw error

    const appLinks = (data || [])
      .map((item, index) => ({
        content_item_id: item.id,
        link_type: samples[index].app_link_type,
        target_id: samples[index].app_link_target_id || '',
        cta_text: samples[index].app_cta || '',
      }))
      .filter((link) => link.link_type)

    if (appLinks.length) {
      const { error: linkError } = await supabase.from('content_app_links').insert(appLinks)
      if (linkError) throw linkError
    }

    return (data || []).map((item) => ({
      ...item,
      social_posts: [],
      content_app_links: appLinks.filter((link) => link.content_item_id === item.id),
      content_webhook_events: [],
    }))
  }

  const created = []
  for (const sample of samples) {
    created.push(await createContent({
      ...sample,
      slug: `${slugify(sample.title)}-${Date.now()}-${created.length + 1}`,
    }))
  }
  return created
}

export async function updateContent(id, updates) {
  const sanitized = { ...updates }
  delete sanitized.id
  delete sanitized.social_posts
  delete sanitized.content_app_links
  delete sanitized.content_webhook_events

  if (sanitized.content_type) {
    Object.assign(sanitized, normalizeItem({ ...sanitized, title: sanitized.title || updates.title }))
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('content_items')
      .update({ ...sanitized, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return getContent(id)
  }

  const index = memory.items.findIndex((item) => item.id === id)
  if (index === -1) return null
  memory.items[index] = { ...memory.items[index], ...sanitized, updated_at: new Date().toISOString() }
  return hydrateMemoryItem(memory.items[index])
}

export async function upsertAppLink(contentItemId, input) {
  const link = {
    content_item_id: contentItemId,
    link_type: input.app_link_type,
    target_id: input.app_link_target_id || '',
    cta_text: input.app_cta || input.cta_text || '',
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase.from('content_app_links').insert(link)
    if (error) throw error
    return
  }

  memory.appLinks.push({ id: crypto.randomUUID(), ...link, created_at: new Date().toISOString() })
}

export async function approveContent(id, reviewer = null) {
  const item = await getContent(id)
  if (!item) return null
  const errors = validateForApproval(item)
  if (errors.length) {
    const error = new Error(errors.join(' '))
    error.status = 400
    throw error
  }
  return updateContent(id, {
    status: 'approved',
    reviewed_by: reviewer,
    reviewed_at: new Date().toISOString(),
    rejection_reason: '',
  })
}

export async function rejectContent(id, reason = '') {
  return updateContent(id, {
    status: 'rejected',
    rejection_reason: reason || 'Rejected in Content Command Center.',
    reviewed_at: new Date().toISOString(),
  })
}

function hashtagsFor(item, platform) {
  const tags = ['#StarKidCommand']
  if (item.is_launch_related || item.content_type.includes('launch')) tags.push('#Launch')
  if (item.is_lunar_related || item.content_type.includes('artemis')) tags.push('#Moon')
  if (item.is_stem_related || item.stem_tie_in) tags.push('#STEM')
  if (platform === 'linkedin') return tags.filter((tag) => tag !== '#Moon')
  return tags.slice(0, 4)
}

function captionFor(item, platform) {
  const source = item.source_name ? ` Source: ${item.source_name}${item.source_url ? ` ${item.source_url}` : ''}` : ''
  const tieIn = item.stem_tie_in ? ` STEM tie-in: ${item.stem_tie_in}` : ''
  const cta = item.app_cta || 'Track the mission in StarKid Command.'
  const summary = item.excerpt || item.body?.slice(0, 180) || item.title

  if (platform === 'instagram') {
    return `Mission signal: ${item.title}\n\n${summary}\n\n${cta}${source}\n${hashtagsFor(item, platform).join(' ')}`
  }
  if (platform === 'facebook') {
    return `${item.title}\n\n${summary}${tieIn}\n\n${cta}${source}\n${hashtagsFor(item, platform).join(' ')}`
  }
  if (platform === 'linkedin') {
    return `${item.title}\n\nA StarKid Command update connecting space exploration with STEM learning. ${summary}${tieIn}\n\n${source.trim()}`
  }
  if (platform === 'x') {
    return `${item.title}: ${summary.slice(0, 120)} ${item.source_name ? `via ${item.source_name}` : ''} ${hashtagsFor(item, platform).slice(0, 2).join(' ')}`
  }
  if (platform === 'threads') {
    return `${item.title}\n\n${summary}\n\nTiny mission-control question: what would you ask the team next?${source}`
  }
  return `Shorts title: ${item.title}\nHook: ${summary.slice(0, 90)}\nDescription: ${summary}\nVisual idea: Mission-control cards, launch imagery, and one simple STEM diagram.\n${source}`
}

export async function generateSocialPack(id) {
  const item = await getContent(id)
  if (!item) return null
  const rule = getDistributionRule(item.content_type)
  const platforms = Array.from(new Set([...rule.defaultPlatforms, 'youtube_shorts']))
  const now = new Date().toISOString()
  const posts = platforms.map((platform) => ({
    content_item_id: id,
    platform,
    title: platform === 'youtube_shorts' ? `${item.title} | StarKid Short` : item.title,
    body: captionFor(item, platform),
    caption: captionFor(item, platform),
    hashtags: hashtagsFor(item, platform),
    status: 'draft',
    scheduled_for: item.scheduled_for || null,
    metadata: platform === 'youtube_shorts'
      ? {
          title: item.title,
          description: item.excerpt || item.body || item.title,
          hook: (item.excerpt || item.title).slice(0, 120),
          visual_idea: 'Mission-control overlay, source image or launch/lunar visual, and one STEM concept callout.',
        }
      : {},
  }))

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error: deleteError } = await supabase.from('social_posts').delete().eq('content_item_id', id)
    if (deleteError) throw deleteError
    const { error } = await supabase.from('social_posts').insert(posts)
    if (error) throw error
    return getContent(id)
  }

  memory.socialPosts = memory.socialPosts.filter((post) => post.content_item_id !== id)
  memory.socialPosts.push(...posts.map((post) => ({ id: crypto.randomUUID(), ...post, created_at: now, updated_at: now })))
  return getContent(id)
}

export async function updateSocialPosts(id, posts = []) {
  const now = new Date().toISOString()

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    for (const post of posts) {
      if (!post.id) continue
      const { error } = await supabase
        .from('social_posts')
        .update({
          caption: post.caption || post.body || '',
          body: post.caption || post.body || '',
          hashtags: post.hashtags || [],
          media_url: post.media_url || null,
          scheduled_for: post.scheduled_for || null,
          updated_at: now,
        })
        .eq('id', post.id)
        .eq('content_item_id', id)
      if (error) throw error
    }
    return getContent(id)
  }

  memory.socialPosts = memory.socialPosts.map((existing) => {
    const update = posts.find((post) => post.id === existing.id && existing.content_item_id === id)
    if (!update) return existing
    return {
      ...existing,
      caption: update.caption || update.body || '',
      body: update.caption || update.body || '',
      hashtags: update.hashtags || [],
      media_url: update.media_url || '',
      scheduled_for: update.scheduled_for || null,
      updated_at: now,
    }
  })
  return getContent(id)
}

function buildBlogUrl(item) {
  const base = process.env.PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL || 'https://starkidcommand.com'
  return `${base.replace(/\/$/, '')}/updates/blog/${item.slug || item.id}`
}

export function buildWebhookPayload(item) {
  const socialPosts = item.social_posts || []
  const appLink = item.content_app_links?.[0]
  return {
    contentItemId: item.id,
    isTest: Boolean(item.is_test),
    title: item.title,
    contentType: item.content_type,
    sourceName: item.source_name,
    sourceUrl: item.source_url,
    blogUrl: buildBlogUrl(item),
    scheduledFor: item.scheduled_for,
    platforms: socialPosts
      .filter((post) => post.platform !== 'youtube_shorts')
      .map((post) => ({
        platform: post.platform,
        caption: post.caption || post.body,
        hashtags: post.hashtags || [],
        scheduledFor: post.scheduled_for || item.scheduled_for,
      })),
    youtubeShorts: socialPosts.find((post) => post.platform === 'youtube_shorts')?.metadata || null,
    appCta: item.app_cta,
    appLinkType: appLink?.link_type || null,
    missionControlCheck: {
      tracksSpaceEvent: Boolean(item.source_url || item.mission_name),
      launchLinked: Boolean(item.is_launch_related),
      lunarLinked: Boolean(item.is_lunar_related),
      stemLinked: Boolean(item.is_stem_related || item.stem_tie_in),
      encouragesAppUsage: Boolean(item.app_cta || appLink),
    },
  }
}

export async function sendToWebhook(id, options = {}) {
  const item = await getContent(id)
  if (!item) return null
  if (!canDistribute(item) && !(options.allowFailedRetry && canRetryWebhook(item))) {
    const error = new Error('Content must be approved before it can be sent to Buffer.')
    error.status = 400
    throw error
  }
  if (!item.social_posts?.length) {
    const error = new Error('Generate social captions before sending to Buffer.')
    error.status = 400
    throw error
  }

  const webhookUrl = process.env.CONTENT_AUTOMATION_WEBHOOK_URL || process.env.VITE_CONTENT_WEBHOOK_URL
  const payload = buildWebhookPayload(item)
  const eventBase = {
    content_item_id: id,
    webhook_type: 'buffer_export',
    destination: webhookUrl || 'not_configured',
    payload,
    status: 'pending',
  }

  try {
    if (!webhookUrl) {
      const error = new Error('Content automation webhook is not configured. Add CONTENT_AUTOMATION_WEBHOOK_URL in Vercel to enable Buffer export.')
      error.status = 503
      throw error
    }

    const headers = { 'Content-Type': 'application/json' }
    const secret = process.env.CONTENT_AUTOMATION_WEBHOOK_SECRET || process.env.CONTENT_WEBHOOK_SECRET
    if (secret) headers['X-StarKid-Content-Secret'] = secret

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    const responseText = await response.text()
    let responseBody = { status: response.status, body: responseText }
    try {
      responseBody = { status: response.status, body: JSON.parse(responseText) }
    } catch {
      responseBody = { status: response.status, body: responseText }
    }

    if (!response.ok) {
      throw new Error(`Webhook failed with HTTP ${response.status}`)
    }

    await saveWebhookEvent({ ...eventBase, response: responseBody, status: 'sent', sent_at: new Date().toISOString() })
    await markSentToBuffer(id, payload, responseBody)
    return getContent(id)
  } catch (error) {
    await saveWebhookEvent({ ...eventBase, status: 'failed', error_message: error.message })
    await updateContent(id, { status: 'failed' })
    throw error
  }
}

async function markSentToBuffer(id, payload, response) {
  const now = new Date().toISOString()
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    await supabase
      .from('social_posts')
      .update({
        status: 'sent_to_buffer',
        sent_to_buffer_at: now,
        buffer_payload: payload,
        buffer_response: response,
      })
      .eq('content_item_id', id)
    await updateContent(id, { status: 'sent_to_buffer' })
    return
  }

  memory.socialPosts = memory.socialPosts.map((post) =>
    post.content_item_id === id
      ? { ...post, status: 'sent_to_buffer', sent_to_buffer_at: now, buffer_payload: payload, buffer_response: response }
      : post
  )
  await updateContent(id, { status: 'sent_to_buffer' })
}

export async function saveWebhookEvent(event) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase.from('content_webhook_events').insert(event)
    if (error) throw error
    return
  }
  memory.webhookEvents.push({
    id: crypto.randomUUID(),
    ...event,
    created_at: new Date().toISOString(),
  })
}

function hydrateMemoryItem(item) {
  return {
    ...item,
    social_posts: memory.socialPosts.filter((post) => post.content_item_id === item.id),
    content_app_links: memory.appLinks.filter((link) => link.content_item_id === item.id),
    content_webhook_events: memory.webhookEvents.filter((event) => event.content_item_id === item.id),
  }
}
