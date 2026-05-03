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

  const { supabaseAuthStorage } = getCoreConfig()

  // In React Native, Supabase requires an explicit storage adapter so sessions
  // persist across app restarts. On web we can omit and use default localStorage.
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: supabaseAuthStorage ? { storage: supabaseAuthStorage, persistSession: true, autoRefreshToken: true } : undefined,
  })
  return supabase
}

export function isSupabaseConfigured() {
  return getSupabaseClient() !== null
}
