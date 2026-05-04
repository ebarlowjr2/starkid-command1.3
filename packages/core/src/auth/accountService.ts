import { getCoreConfig } from '../config/coreConfig'
import { getSession, signOut } from './service'
import { getSupabaseClient } from '../clients/supabase/supabase'

export async function deleteAccount() {
  const session = await getSession()
  if (!session?.userId) throw new Error('Authentication required')

  const apiBase = getCoreConfig().apiBase
  if (!apiBase) throw new Error('apiBase not configured')

  const supabase = getSupabaseClient()
  const { data } = supabase ? await supabase.auth.getSession() : { data: null }
  const accessToken = data?.session?.access_token
  if (!accessToken) throw new Error('No access token available')

  const res = await fetch(`${apiBase}/account/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) {
    let msg = 'Account deletion failed'
    try {
      const data = await res.json()
      msg = data?.error || data?.message || msg
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  // Best-effort: clear local session.
  await signOut()
  return true
}
