import {
  createContent,
  createSmokeTestItems,
  listContent,
  parseBody,
  requireOps,
  setCors,
} from './_store.js'

export default async function handler(req, res) {
  setCors(res, 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const filter = req.query?.filter || 'all'
      const items = await listContent(filter)
      res.status(200).json({ items })
      return
    }

    if (req.method === 'POST') {
      if (!requireOps(req, res)) return
      const body = parseBody(req)
      if (body.action === 'seed_test_items') {
        const items = await createSmokeTestItems()
        res.status(201).json({ items })
        return
      }
      const item = await createContent(body)
      res.status(201).json({ item })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Content API failed' })
  }
}
