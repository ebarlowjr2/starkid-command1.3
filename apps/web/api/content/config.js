import { setCors } from './_store.js'

export default async function handler(req, res) {
  setCors(res, 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.status(200).json({
    webhookConfigured: Boolean(process.env.CONTENT_AUTOMATION_WEBHOOK_URL || process.env.VITE_CONTENT_WEBHOOK_URL),
    webhookSecretConfigured: Boolean(process.env.CONTENT_AUTOMATION_WEBHOOK_SECRET || process.env.CONTENT_WEBHOOK_SECRET),
    supabaseConfigured: Boolean(
      process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)
    ),
  })
}
