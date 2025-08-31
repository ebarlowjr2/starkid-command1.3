// api/astros.js
// Vercel Serverless Function: proxies Open-Notify crew list (no CORS there)

module.exports = async (req, res) => {
  try {
    const upstream = await fetch('http://api.open-notify.org/astros.json'); // HTTP is correct
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'upstream error' });
      return;
    }
    const data = await upstream.json();
    const issCrew = (data.people || []).filter(
      (p) => (p.craft || '').toUpperCase().includes('ISS')
    );

    // Allow browser consumption
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ total: data.number, iss: issCrew });
  } catch (e) {
    res.status(500).json({ error: 'proxy failed', detail: String(e) });
  }
};
