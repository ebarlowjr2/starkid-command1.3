// api/lib/supabase.js
// Supabase client for serverless API routes

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

let supabase = null

function getSupabase() {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabase
}

function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseServiceKey)
}

module.exports = { getSupabase, isSupabaseConfigured }
