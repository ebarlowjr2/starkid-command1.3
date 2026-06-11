import {
  getContent,
  parseBody,
  requireOps,
  setCors,
  updateContent,
} from './_store.js'

export default async function handler(req, res) {
  setCors(res, 'GET, PATCH, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const id = req.query?.id
  if (!id) {
    res.status(400).json({ error: 'Content id required' })
    return
  }

  try {
    if (req.method === 'GET') {
      const item = await getContent(id)
      if (!item) {
        res.status(404).json({ error: 'Content item not found' })
        return
      }
      res.status(200).json({ item })
      return
    }

    if (req.method === 'PATCH') {
      if (!requireOps(req, res)) return
      const item = await updateContent(id, parseBody(req))
      if (!item) {
        res.status(404).json({ error: 'Content item not found' })
        return
      }
      res.status(200).json({ item })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Content API failed' })
  }
}
