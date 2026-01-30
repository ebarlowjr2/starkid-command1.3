// api/events/recent.js
// Get recent events from mission_events table

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
  const { category, subtype, limit = 50 } = req.query
  const limitNum = Math.min(parseInt(limit) || 50, 100)
  
  try {
    let query = supabase
      .from('mission_events')
      .select('*')
      .lte('event_time_utc', new Date().toISOString())
      .order('event_time_utc', { ascending: false })
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
      events: data
    })
    
  } catch (error) {
    console.error('Error fetching recent events:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
