import { executeContentAction } from '../_actions.js'
import { parseBody, requireOps, setCors } from '../_store.js'

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!requireOps(req, res)) return

  const id = req.query?.id
  const body = parseBody(req)

  try {
    const item = await executeContentAction(id, body.action, body)
    res.status(200).json({ item })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Content action failed' })
  }
}
