const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, locked: true, waitSeconds };
  }

  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.delete(ip);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
    rateLimitStore.set(ip, record);
    const waitSeconds = Math.ceil(LOCKOUT_DURATION / 1000);
    return { allowed: false, locked: true, waitSeconds };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.attempts - 1 };
}

function recordAttempt(ip, success) {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { attempts: 0, windowStart: now };

  if (success) {
    rateLimitStore.delete(ip);
    return;
  }

  record.attempts += 1;
  record.windowStart = record.windowStart || now;
  rateLimitStore.set(ip, record);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OPS-KEY');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(ip);

  if (!rateCheck.allowed) {
    res.status(429).json({
      authorized: false,
      error: 'LOCKOUT ACTIVE',
      message: `Too many failed attempts. Try again in ${rateCheck.waitSeconds} seconds.`,
      waitSeconds: rateCheck.waitSeconds,
    });
    return;
  }

  const opsKey = process.env.OPS_ACCESS_KEY;

  if (!opsKey) {
    res.status(503).json({
      authorized: false,
      error: 'OPS SYSTEM OFFLINE',
      message: 'Ops access key not configured on server.',
    });
    return;
  }

  const providedKey = req.headers['x-ops-key'];

  if (!providedKey) {
    recordAttempt(ip, false);
    res.status(401).json({
      authorized: false,
      error: 'ACCESS DENIED',
      message: 'Missing ops key header.',
      remaining: rateCheck.remaining,
    });
    return;
  }

  if (providedKey !== opsKey) {
    recordAttempt(ip, false);
    res.status(401).json({
      authorized: false,
      error: 'ACCESS DENIED',
      message: 'Invalid ops key.',
      remaining: rateCheck.remaining,
    });
    return;
  }

  recordAttempt(ip, true);

  res.status(200).json({
    authorized: true,
    message: 'OPS ACCESS GRANTED',
  });
}
