// api/events/upcoming.js
// Get upcoming events from mission_events table

const { getSupabase, isSupabaseConfigured } = require('../lib/supabase.js')

module.exports = async (req, res) => {
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
  const { category, subtype, days = 60, limit = 100 } = req.query
  const daysNum = Math.min(parseInt(days) || 60, 365)
  const limitNum = Math.min(parseInt(limit) || 100, 200)
  
  const now = new Date()
  const endDate = new Date(now.getTime() + daysNum * 24 * 60 * 60 * 1000)
  
  try {
    let query = supabase
      .from('mission_events')
      .select('*')
      .gte('event_time_utc', now.toISOString())
      .lte('event_time_utc', endDate.toISOString())
      .order('event_time_utc', { ascending: true })
      .limit(limitNum)
    
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
    
    return res.status(200).json({
      success: true,
      count: data.length,
      days: daysNum,
      events: data
    })
    
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
