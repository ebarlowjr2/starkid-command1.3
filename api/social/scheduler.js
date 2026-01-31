// api/social/scheduler.js
// Social post scheduler - creates drafts at T-7d, T-24h, T-1h windows
// Scheduled via Vercel cron (hourly)

import { getSupabase, isSupabaseConfigured } from '../_lib/supabase.js'

// Reminder windows in milliseconds
const REMINDER_WINDOWS = {
  'T-7d': 7 * 24 * 60 * 60 * 1000,   // 7 days before
  'T-24h': 24 * 60 * 60 * 1000,       // 24 hours before
  'T-1h': 60 * 60 * 1000              // 1 hour before
}

// Window tolerance (to avoid duplicate posts within same window)
const WINDOW_TOLERANCE = 2 * 60 * 60 * 1000  // 2 hours

/**
 * Generate social post content based on reminder type
 * @param {Object} event 
 * @param {string} reminderType 
 * @returns {Object}
 */
function generatePostContent(event, reminderType) {
  const eventDate = new Date(event.event_time_utc)
  const dateStr = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric'
  })
  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  })
  
  const phaseName = event.metadata?.phase_name || event.title
  let body = ''
  let hashtags = ['#Astronomy', '#SkyEvents', '#StarKid']
  
  // Customize based on event type and reminder window
  if (event.subtype === 'moon_phase') {
    hashtags.push('#MoonPhase')
    
    if (phaseName.includes('Full')) {
      hashtags.push('#FullMoon')
      switch (reminderType) {
        case 'T-7d':
          body = `Mark your calendars! A Full Moon is coming on ${dateStr}. Start planning your moongazing adventure!`
          break
        case 'T-24h':
          body = `Tomorrow night: Full Moon! Get ready for a bright, beautiful night sky on ${dateStr}.`
          break
        case 'T-1h':
          body = `Look up! The Full Moon is rising soon. Head outside and enjoy the show!`
          break
        default:
          body = `Full Moon tonight at ${timeStr}! Perfect night for stargazing with the family.`
      }
    } else if (phaseName.includes('New')) {
      hashtags.push('#NewMoon', '#Stargazing')
      switch (reminderType) {
        case 'T-7d':
          body = `New Moon coming on ${dateStr}! The darkest skies of the month - perfect for deep sky observation.`
          break
        case 'T-24h':
          body = `Tomorrow: New Moon! Get ready for the best stargazing conditions of the month.`
          break
        case 'T-1h':
          body = `New Moon tonight! Head outside to see the Milky Way and faint stars you can't normally see.`
          break
        default:
          body = `New Moon at ${timeStr}! Best night this month for stargazing.`
      }
    }
  } else if (event.subtype === 'meteor_shower') {
    hashtags.push('#MeteorShower', '#ShootingStars')
    switch (reminderType) {
      case 'T-7d':
        body = `Meteor shower alert! ${event.title} peaks on ${dateStr}. Start planning your viewing spot!`
        break
      case 'T-24h':
        body = `Tomorrow night: ${event.title}! Find a dark spot away from city lights for the best show.`
        break
      case 'T-1h':
        body = `${event.title} is happening NOW! Grab a blanket, lie back, and count the shooting stars!`
        break
      default:
        body = `${event.title} peaks tonight! ${event.visibility || 'Best viewed after midnight.'}`
    }
  } else if (event.subtype === 'eclipse') {
    hashtags.push('#Eclipse')
    const isLunar = event.title.toLowerCase().includes('lunar')
    if (isLunar) {
      hashtags.push('#LunarEclipse')
    } else {
      hashtags.push('#SolarEclipse')
    }
    switch (reminderType) {
      case 'T-7d':
        body = `Eclipse alert! ${event.title} on ${dateStr}. ${event.visibility || ''} Don't miss this rare event!`
        break
      case 'T-24h':
        body = `Tomorrow: ${event.title}! ${isLunar ? 'Safe to watch with naked eyes.' : 'Remember: NEVER look directly at the Sun without proper eclipse glasses!'}`
        break
      case 'T-1h':
        body = `${event.title} starting soon! ${event.visibility || ''}`
        break
      default:
        body = `${event.title} happening now! ${event.description || ''}`
    }
  } else if (event.subtype === 'conjunction') {
    hashtags.push('#Conjunction', '#Planets')
    switch (reminderType) {
      case 'T-7d':
        body = `Planetary meetup coming! ${event.title} on ${dateStr}. A great photo opportunity!`
        break
      case 'T-24h':
        body = `Tomorrow: ${event.title}! Look for two bright objects close together in the sky.`
        break
      case 'T-1h':
        body = `${event.title} is happening! Head outside and look ${event.visibility || 'toward the horizon'}.`
        break
      default:
        body = `${event.title} tonight! ${event.description || ''}`
    }
  } else {
    // Generic sky event
    switch (reminderType) {
      case 'T-7d':
        body = `Sky event coming: ${event.title} on ${dateStr}. ${event.description || ''}`
        break
      case 'T-24h':
        body = `Tomorrow: ${event.title}! ${event.visibility || 'Check local conditions.'}`
        break
      case 'T-1h':
        body = `${event.title} is happening soon! Head outside and look up!`
        break
      default:
        body = `${event.title} tonight! ${event.description || ''}`
    }
  }
  
  return { body, hashtags }
}

/**
 * Check if a post already exists for this event and reminder type
 * @param {Object} supabase 
 * @param {string} eventId 
 * @param {string} reminderType 
 * @returns {Promise<boolean>}
 */
async function postExists(supabase, eventId, reminderType) {
  const { data, error } = await supabase
    .from('social_posts')
    .select('id')
    .eq('event_id', eventId)
    .eq('reminder_type', reminderType)
    .limit(1)
  
  if (error) {
    console.error('Error checking existing post:', error)
    return false
  }
  
  return data && data.length > 0
}

/**
 * Create a scheduled social post
 * @param {Object} supabase 
 * @param {Object} event 
 * @param {string} reminderType 
 * @returns {Promise<boolean>}
 */
async function createScheduledPost(supabase, event, reminderType) {
  // Check if post already exists
  if (await postExists(supabase, event.id, reminderType)) {
    return false
  }
  
  const { body, hashtags } = generatePostContent(event, reminderType)
  
  // Calculate scheduled time based on reminder type
  const eventTime = new Date(event.event_time_utc)
  const scheduledFor = new Date(eventTime.getTime() - REMINDER_WINDOWS[reminderType])
  
  const post = {
    event_id: event.id,
    title: event.title,
    body,
    hashtags,
    platform: 'all',
    status: 'SCHEDULED',
    scheduled_for: scheduledFor.toISOString(),
    reminder_type: reminderType,
    metadata: {
      auto_generated: true,
      event_category: event.category,
      event_subtype: event.subtype,
      event_time: event.event_time_utc
    }
  }
  
  const { error } = await supabase
    .from('social_posts')
    .insert(post)
  
  if (error) {
    console.error(`Error creating ${reminderType} post for ${event.title}:`, error)
    return false
  }
  
  return true
}

/**
 * Find posts that are due to be posted (scheduled time has passed)
 * @param {Object} supabase 
 * @returns {Promise<Array>}
 */
async function findDuePosts(supabase) {
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .in('status', ['SCHEDULED', 'APPROVED'])
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
  
  if (error) {
    console.error('Error finding due posts:', error)
    return []
  }
  
  return data || []
}

/**
 * Main handler for the social scheduler endpoint
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (!isSupabaseConfigured()) {
    return res.status(500).json({
      error: 'Supabase not configured',
      message: 'Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
    })
  }
  
  const supabase = getSupabase()
  const now = new Date()
  
  const results = {
    postsCreated: {
      'T-7d': 0,
      'T-24h': 0,
      'T-1h': 0
    },
    postsDue: 0,
    errors: []
  }
  
  try {
    // Find upcoming high-signal events that need scheduled posts
    for (const [reminderType, windowMs] of Object.entries(REMINDER_WINDOWS)) {
      // Find events within this reminder window
      const windowStart = new Date(now.getTime() + windowMs - WINDOW_TOLERANCE)
      const windowEnd = new Date(now.getTime() + windowMs + WINDOW_TOLERANCE)
      
      const { data: events, error } = await supabase
        .from('mission_events')
        .select('*')
        .eq('social_draft_eligible', true)
        .gte('event_time_utc', windowStart.toISOString())
        .lte('event_time_utc', windowEnd.toISOString())
      
      if (error) {
        results.errors.push({ reminderType, error: error.message })
        continue
      }
      
      // Create posts for each eligible event
      for (const event of (events || [])) {
        const created = await createScheduledPost(supabase, event, reminderType)
        if (created) {
          results.postsCreated[reminderType]++
        }
      }
    }
    
    // Find posts that are due to be posted
    const duePosts = await findDuePosts(supabase)
    results.postsDue = duePosts.length
    
    // Mark due posts as ready for ops approval (move from SCHEDULED to DRAFT for review)
    // In a full implementation, this would integrate with your posting system
    for (const post of duePosts) {
      if (post.status === 'SCHEDULED') {
        await supabase
          .from('social_posts')
          .update({ status: 'DRAFT', updated_at: now.toISOString() })
          .eq('id', post.id)
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Social scheduler completed',
      results,
      timestamp: now.toISOString()
    })
    
  } catch (error) {
    console.error('Social scheduler error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      results
    })
  }
}
