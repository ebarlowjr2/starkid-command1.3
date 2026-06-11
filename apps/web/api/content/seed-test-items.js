import { createSmokeTestItems, requireOps, setCors } from './_store.js'

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

  try {
    const items = await createSmokeTestItems()
    res.status(201).json({ items })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to create smoke test content' })
  }
}
