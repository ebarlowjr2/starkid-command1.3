import { executeContentAction } from '../_actions.js'
import { parseBody, requireOps, setCors } from '../_store.js'

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireOps(req, res)) return

  try {
    const item = await executeContentAction(req.query?.id, 'approve', parseBody(req))
    res.status(200).json({ item })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Content approval failed' })
  }
}
