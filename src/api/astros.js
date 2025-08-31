// api/astros.js  (Vercel Serverless Function)
export default async function handler(req, res) {
    try {
      const resp = await fetch('http://api.open-notify.org/astros.json')
      if (!resp.ok) return res.status(resp.status).json({ error: 'upstream error' })
      const data = await resp.json()
      const issCrew = (data.people || []).filter(p => (p.craft || '').toUpperCase().includes('ISS'))
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.status(200).json({ total: data.number, iss: issCrew })
    } catch (e) {
      res.status(500).json({ error: 'proxy failed', detail: String(e) })
    }
  }
  