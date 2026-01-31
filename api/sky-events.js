// api/sky-events.js
// Consolidated endpoint for sky events from mission_events table
// Supports both recent (past) and upcoming (future) queries via ?type= parameter

import { getSupabase, isSupabaseConfigured } from './_lib/supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  
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
  
  // Parse query parameters
  // type: 'recent' (past events) or 'upcoming' (future events, default)
  const { type = 'upcoming', category, subtype, days = 60, limit = 100 } = req.query
  const daysNum = Math.min(parseInt(days) || 60, 365)
  const limitNum = Math.min(parseInt(limit) || 100, 200)
  
  const now = new Date()
  
  try {
    let query = supabase
      .from('mission_events')
      .select('*')
    
    if (type === 'recent') {
      // Past events - ordered by most recent first
      query = query
        .lte('event_time_utc', now.toISOString())
        .order('event_time_utc', { ascending: false })
        .limit(Math.min(limitNum, 100))
    } else {
      // Upcoming events - ordered by soonest first
      const endDate = new Date(now.getTime() + daysNum * 24 * 60 * 60 * 1000)
      query = query
        .gte('event_time_utc', now.toISOString())
        .lte('event_time_utc', endDate.toISOString())
        .order('event_time_utc', { ascending: true })
        .limit(limitNum)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (subtype) {
      query = query.eq('subtype', subtype)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    const response = {
      success: true,
      type,
      count: data.length,
      events: data
    }
    
    if (type === 'upcoming') {
      response.days = daysNum
    }
    
    return res.status(200).json(response)
    
  } catch (error) {
    console.error('Error fetching sky events:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
