// api/_lib/supabase.js
// Supabase client for serverless API routes

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
// Support both SUPABASE_SERVICE_KEY and SUPABASE_SERVICE_ROLE_KEY for flexibility
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null

export function getSupabase() {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabase
}

export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseServiceKey)
}
