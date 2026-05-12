import { createClient } from '@supabase/supabase-js'

function getBearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization
  if (!auth) return null
  const parts = String(auth).split(' ')
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1]
  return null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return res.status(503).json({ error: 'Server not configured for account deletion' })
  }

  const accessToken = getBearerToken(req)
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' })
  }

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } })

  // Verify caller identity.
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
  const userId = userData?.user?.id
  if (userError || !userId) {
    return res.status(401).json({ error: 'Invalid access token' })
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    return res.status(500).json({ error: error.message || 'Failed to delete user' })
  }

  return res.status(200).json({ ok: true })
}

