// src/lib/supabase.js
// Supabase client for browser-side operations

import { createClient } from '@supabase/supabase-js'
import { getCoreConfig } from '../../config/coreConfig.ts'

export let supabase = null
let warned = false

function getSupabaseConfig() {
  const { supabaseUrl, supabaseAnonKey } = getCoreConfig()
  return { supabaseUrl, supabaseAnonKey }
}

export function getSupabaseClient() {
  if (supabase) return supabase

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warned) {
      console.warn('Supabase credentials not configured. Some features may not work.')
      warned = true
    }
    return null
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  return supabase
}

export function isSupabaseConfigured() {
  return getSupabaseClient() !== null
}
