import type { AuthProvider } from './types.ts'
import { getSupabaseClient } from '../clients/supabase/supabase.js'
import { setUserSession } from '../storage/identity.ts'

function toSession(supabaseSession: any) {
  if (!supabaseSession?.user?.id) return null
  return { userId: supabaseSession.user.id }
}

export const supabaseAuthProvider: AuthProvider = {
  async getSession() {
    const supabase = getSupabaseClient()
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return toSession(data?.session)
  },
  async signIn() {
    return
  },
  async signOut() {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
    await setUserSession(null)
  },
  onChange(cb) {
    const supabase = getSupabaseClient()
    if (!supabase) return () => {}
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const mapped = toSession(session)
      setUserSession(mapped)
      cb(mapped)
    })
    return () => data?.subscription?.unsubscribe()
  },
}
