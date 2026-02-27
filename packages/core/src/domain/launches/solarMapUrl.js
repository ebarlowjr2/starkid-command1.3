/**
 * URL helpers for StarKid Solar Map
 * Handles URL params: ?obj=...&date=YYYY-MM-DD&h=...&m=...
 */

/**
 * Parse URL search params into solar map state
 */
export function parseSolarMapParams(search) {
  const sp = new URLSearchParams(search)
  
  const obj = sp.get('obj') || undefined
  
  const dateRaw = sp.get('date')
  const now = new Date()
  const fallbackDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  
  const date = isValidYyyyMmDd(dateRaw) ? dateRaw : fallbackDate
  
  const h = clampInt(parseIntSafe(sp.get('h'), 12), 0, 23)
  const m = clampInt(parseIntSafe(sp.get('m'), 0), 0, 59)
  
  return { obj, date, h, m }
}

/**
 * Build URL search string from solar map state
 */
export function buildSolarMapSearch(params) {
  const sp = new URLSearchParams()
  if (params.obj) sp.set('obj', params.obj)
  sp.set('date', params.date)
  sp.set('h', String(params.h))
  sp.set('m', String(params.m))
  return `?${sp.toString()}`
}

/**
 * Convert date/time params to ISO UTC string
 */
export function toIsoUtc(date, h, m) {
  const [Y, M, D] = date.split('-').map(Number)
  const dt = new Date(Date.UTC(Y, M - 1, D, h, m, 0))
  return dt.toISOString()
}

function parseIntSafe(v, fallback) {
  if (v == null || v.trim() === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function clampInt(n, min, max) {
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

function isValidYyyyMmDd(v) {
  if (!v) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [Y, M, D] = v.split('-').map(Number)
  if (M < 1 || M > 12) return false
  if (D < 1 || D > 31) return false
  const dt = new Date(Date.UTC(Y, M - 1, D))
  return dt.getUTCFullYear() === Y && dt.getUTCMonth() === M - 1 && dt.getUTCDate() === D
}
