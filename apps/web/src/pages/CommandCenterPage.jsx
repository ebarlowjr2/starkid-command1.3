import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Globe from '../components/Globe.jsx'
import { getOpenEarthEvents, getSolarActivity, getUpcomingLaunches } from '@starkid/core'

const REFRESH_INTERVAL_MS = 30 * 60 * 1000

const LAYER_OPTIONS = [
  { id: 'launches', label: 'Launches' },
  { id: 'earth-events', label: 'Earth events' },
  { id: 'space-weather', label: 'Space weather' },
]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
})

function formatDate(value, fallback = 'Time TBD') {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date)
}

function statusTone(launch) {
  const value = String(launch?.status?.abbrev || launch?.status?.name || 'TBD').toLowerCase()
  if (value.includes('go') || value.includes('success')) return 'go'
  if (value.includes('hold') || value.includes('delay')) return 'hold'
  return 'launch'
}

function buildFeedItems({ launches, earthEvents, solar, activeLayers }) {
  const items = []

  if (activeLayers.includes('space-weather') && solar) {
    const strongestClass = solar.strongestClass && solar.strongestClass !== 'None'
      ? `Class ${solar.strongestClass}`
      : 'No elevated class'
    items.push({
      id: 'space-weather-summary',
      kind: 'space-weather',
      title: `Solar activity: ${strongestClass}`,
      source: 'NASA DONKI',
      detail: `${solar.flaresCount || 0} flare${solar.flaresCount === 1 ? '' : 's'} • ${solar.cmeCount || 0} CME${solar.cmeCount === 1 ? '' : 's'} in the current window`,
      sortTime: Date.now(),
    })
  }

  if (activeLayers.includes('launches')) {
    launches.forEach((launch) => {
      items.push({
        id: `launch-${launch?.id || launch?.name}`,
        kind: statusTone(launch),
        title: launch?.name || 'Mission details updating',
        source: launch?.providerName || 'Launch provider pending',
        detail: `NET ${formatDate(launch?.net || launch?.window_start, 'TBD')}`,
        sortTime: new Date(launch?.net || launch?.window_start || 0).getTime() || Number.MAX_SAFE_INTEGER,
      })
    })
  }

  if (activeLayers.includes('earth-events')) {
    earthEvents.forEach((event) => {
      items.push({
        id: `earth-${event.id}`,
        kind: 'earth-event',
        title: event.title,
        source: event.category,
        detail: [event.magnitude, formatDate(event.observedAt, 'Observation time TBD')].filter(Boolean).join(' • '),
        sortTime: new Date(event.observedAt || 0).getTime() || 0,
      })
    })
  }

  return items.sort((a, b) => {
    if (a.kind === 'space-weather') return -1
    if (b.kind === 'space-weather') return 1
    return a.sortTime - b.sortTime
  })
}

function FeedRow({ item }) {
  return (
    <article className="command-feed-row">
      <span className="command-feed-status" data-kind={item.kind} aria-hidden="true" />
      <div className="command-feed-copy">
        <strong>{item.title}</strong>
        <span>{item.source}</span>
        <small>{item.detail}</small>
      </div>
    </article>
  )
}

export default function CommandCenterPage() {
  const [launches, setLaunches] = useState([])
  const [solar, setSolar] = useState(null)
  const [earthEvents, setEarthEvents] = useState([])
  const [activeLayers, setActiveLayers] = useState(() => LAYER_OPTIONS.map((layer) => layer.id))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [resetSignal, setResetSignal] = useState(0)

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      getUpcomingLaunches({ limit: 12 }),
      getSolarActivity({ days: 3 }),
      getOpenEarthEvents({ limit: 30, days: 14 }),
    ])
    const failedSources = []

    if (results[0].status === 'fulfilled') setLaunches(Array.isArray(results[0].value?.data) ? results[0].value.data : [])
    else failedSources.push('launch')

    if (results[1].status === 'fulfilled') setSolar(results[1].value?.data || null)
    else failedSources.push('space-weather')

    if (results[2].status === 'fulfilled') setEarthEvents(Array.isArray(results[2].value?.data) ? results[2].value.data : [])
    else failedSources.push('Earth-event')

    setError(failedSources.length ? `${failedSources.join(', ')} data is temporarily unavailable. Visible layers will continue using the latest available feed.` : null)
    setUpdatedAt(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [load])

  const layerCounts = useMemo(() => ({
    launches: launches.filter((launch) => Number.isFinite(Number(launch?.pad?.latitude)) && Number.isFinite(Number(launch?.pad?.longitude))).length,
    'earth-events': earthEvents.length,
    'space-weather': solar ? 1 : 0,
  }), [earthEvents, launches, solar])

  const feedItems = useMemo(
    () => buildFeedItems({ launches, earthEvents, solar, activeLayers }).slice(0, 7),
    [activeLayers, earthEvents, launches, solar],
  )

  const totalVisibleItems = activeLayers.reduce((total, layerId) => total + (layerCounts[layerId] || 0), 0)
  const toggleLayer = (layerId) => {
    setActiveLayers((current) => current.includes(layerId)
      ? current.filter((id) => id !== layerId)
      : [...current, layerId])
  }

  return (
    <main className="command-page">
      <header className="command-header">
        <div>
          <h1>Command Center</h1>
          <p>Live mission picture</p>
        </div>
        <div className="command-actions">
          <button className="command-reset" type="button" onClick={() => setResetSignal((value) => value + 1)}>Reset view</button>
          <span className="command-live"><i /> Live</span>
        </div>
      </header>

      <section className="command-stage" aria-label="Global mission picture">
        <div className="command-globe-wrap">
          <Globe launches={launches} earthEvents={earthEvents} activeLayers={activeLayers} resetSignal={resetSignal} />
          <div className="command-globe-shade" aria-hidden="true" />

          <div className="command-layer-panel" aria-label="Data layers">
            <div className="command-layer-heading">
              <span>Data layers</span>
              <button type="button" onClick={() => setActiveLayers(LAYER_OPTIONS.map((layer) => layer.id))}>Show all</button>
            </div>
            <div className="command-layer-list">
              {LAYER_OPTIONS.map((layer) => (
                <button
                  key={layer.id}
                  className="command-layer-toggle"
                  data-layer={layer.id}
                  data-active={activeLayers.includes(layer.id)}
                  type="button"
                  aria-pressed={activeLayers.includes(layer.id)}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <i aria-hidden="true" />
                  <span>{layer.label}</span>
                  <b>{layerCounts[layer.id] || 0}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="command-globe-caption">
            <span><i /> {error ? 'Partial data link' : 'Data link active'}</span>
            <b>{totalVisibleItems} visible signals</b>
            <b>Refresh: 30 min</b>
            <b>{updatedAt ? `Updated ${formatDate(updatedAt, 'just now')}` : 'Initializing data link'}</b>
          </div>
        </div>

        <aside className="command-feed" aria-label="Live mission feed">
          <div className="command-feed-heading">
            <div>
              <h2>Live feed</h2>
              <p>{activeLayers.length ? `${activeLayers.length} active layer${activeLayers.length === 1 ? '' : 's'} • ${totalVisibleItems} signals` : 'Choose a data layer to begin'}</p>
              <span />
            </div>
          </div>
          {loading ? <div className="command-empty">Acquiring mission telemetry...</div> : null}
          {error ? <div className="command-error">{error}</div> : null}
          {!loading && activeLayers.length === 0 ? <div className="command-empty">Select a data layer to restore its globe overlay and feed.</div> : null}
          {!loading && activeLayers.length > 0 && feedItems.length === 0 ? <div className="command-empty">No active signals are available for the selected layers right now.</div> : null}
          {!loading ? feedItems.map((item) => <FeedRow key={item.id} item={item} />) : null}
        </aside>
      </section>

      <section className="command-telemetry" aria-label="Mission telemetry">
        <div><span>Solar activity</span><strong>{solar?.strongestClass && solar.strongestClass !== 'None' ? `Class ${solar.strongestClass}` : 'Nominal'}</strong></div>
        <div><span>Open Earth events</span><strong>{earthEvents.length ? `${earthEvents.length} tracked by NASA` : 'Awaiting event telemetry'}</strong></div>
        <div><span>Launch operations</span><strong>{launches.length ? `${launches.length} upcoming missions tracked` : 'Awaiting launch telemetry'}</strong></div>
      </section>

      <style>{`
        .command-page { --line:rgba(61,235,255,.28); --cyan:#3debff; --amber:#f4bd48; --earth:#ff9a5a; --muted:#8ca1b9; max-width:1480px; margin:0 auto; padding:24px 28px 36px; color:#eaf2ff; }
        .command-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding:0 0 22px; border-bottom:1px solid var(--line); }.command-header h1 { margin:0; font-family:'Audiowide',ui-monospace,monospace; font-size:clamp(1.35rem,2.2vw,2rem); font-weight:400; letter-spacing:.06em; text-transform:uppercase; }.command-header p { margin:8px 0 0; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.72rem; letter-spacing:.17em; text-transform:uppercase; }.command-actions { display:flex; align-items:center; gap:12px; }.command-reset { border:1px solid rgba(61,235,255,.55); background:transparent; color:var(--cyan); padding:11px 14px; font-family:'Audiowide',ui-monospace,monospace; font-size:.68rem; letter-spacing:.09em; text-transform:uppercase; cursor:pointer; transition:background .2s,color .2s; }.command-reset:hover,.command-reset:focus-visible { background:var(--cyan); color:#03101a; outline:none; }.command-live { display:flex; align-items:center; gap:8px; padding:11px 13px; color:var(--amber); border:1px solid rgba(244,189,72,.65); font-family:'Audiowide',ui-monospace,monospace; font-size:.68rem; letter-spacing:.12em; text-transform:uppercase; }.command-live i,.command-globe-caption i { width:8px; height:8px; border-radius:50%; background:var(--amber); box-shadow:0 0 12px rgba(244,189,72,.9); }
        .command-stage { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.39fr); min-height:clamp(560px,68vh,760px); background:radial-gradient(circle at 35% 28%,#102b4b 0%,#06111e 34%,#02060d 77%); border:1px solid var(--line); border-top:0; overflow:hidden; }.command-globe-wrap { position:relative; min-height:560px; overflow:hidden; background:#02060d; }.command-globe-wrap canvas { filter:saturate(.88) contrast(1.08) brightness(.9); }.command-globe-shade { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 48% 50%,transparent 30%,rgba(2,6,13,.1) 56%,rgba(2,6,13,.75) 100%); }
        .command-layer-panel { position:absolute; z-index:1; top:24px; left:24px; width:min(228px,calc(100% - 48px)); background:rgba(3,10,18,.8); border:1px solid rgba(61,235,255,.36); backdrop-filter:blur(10px); }.command-layer-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 13px; border-bottom:1px solid rgba(61,235,255,.23); color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.59rem; letter-spacing:.11em; text-transform:uppercase; }.command-layer-heading button { border:0; padding:0; background:transparent; color:#dce8f6; font:inherit; font-size:.51rem; letter-spacing:.06em; cursor:pointer; text-decoration:underline; }.command-layer-list { display:grid; }.command-layer-toggle { display:grid; grid-template-columns:9px 1fr auto; align-items:center; gap:9px; width:100%; min-height:37px; padding:0 13px; background:transparent; border:0; border-bottom:1px solid rgba(61,235,255,.14); color:#7e93a9; font-family:'Audiowide',ui-monospace,monospace; font-size:.58rem; letter-spacing:.04em; text-align:left; cursor:pointer; }.command-layer-toggle:last-child { border-bottom:0; }.command-layer-toggle i { width:7px; height:7px; border:1px solid currentColor; border-radius:50%; }.command-layer-toggle b { font-size:.56rem; font-weight:400; }.command-layer-toggle[data-active='true'] { color:#e6f9ff; background:rgba(61,235,255,.09); }.command-layer-toggle[data-active='true'] i { background:var(--cyan); border-color:var(--cyan); box-shadow:0 0 8px rgba(61,235,255,.72); }.command-layer-toggle[data-layer='earth-events'][data-active='true'] i { background:var(--earth); border-color:var(--earth); box-shadow:0 0 8px rgba(255,154,90,.72); }.command-layer-toggle[data-layer='space-weather'][data-active='true'] i { background:var(--amber); border-color:var(--amber); box-shadow:0 0 8px rgba(244,189,72,.72); }.command-layer-toggle:focus-visible,.command-layer-heading button:focus-visible { outline:1px solid var(--cyan); outline-offset:-3px; }
        .command-globe-caption { position:absolute; z-index:1; left:26px; right:26px; bottom:22px; display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; color:#9fb4c8; font-size:.72rem; letter-spacing:.04em; }.command-globe-caption span { display:flex; align-items:center; gap:8px; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; text-transform:uppercase; font-size:.62rem; }.command-globe-caption i { background:var(--cyan); box-shadow:0 0 12px rgba(61,235,255,.8); }.command-globe-caption b { font-weight:500; padding-left:18px; border-left:1px solid rgba(159,180,200,.38); }
        .command-feed { display:flex; flex-direction:column; background:linear-gradient(180deg,rgba(3,10,18,.92),rgba(2,6,13,.98)); border-left:1px solid var(--line); padding:28px; overflow:auto; }.command-feed-heading { padding-bottom:16px; }.command-feed-heading h2 { margin:0; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.86rem; letter-spacing:.13em; text-transform:uppercase; font-weight:400; }.command-feed-heading p { margin:9px 0 0; color:var(--muted); font-size:.68rem; }.command-feed-heading span { display:block; width:30px; height:2px; background:var(--cyan); margin-top:14px; }.command-feed-row { display:flex; gap:13px; align-items:flex-start; padding:17px 0; border-top:1px solid rgba(61,235,255,.28); }.command-feed-status { width:7px; height:7px; flex:0 0 auto; margin-top:7px; border-radius:50%; background:#55d7f0; box-shadow:0 0 10px rgba(85,215,240,.65); }.command-feed-status[data-kind='go'] { background:var(--amber); box-shadow:0 0 10px rgba(244,189,72,.65); }.command-feed-status[data-kind='hold'] { background:#fb7a73; box-shadow:0 0 10px rgba(251,122,115,.65); }.command-feed-status[data-kind='earth-event'] { background:var(--earth); box-shadow:0 0 10px rgba(255,154,90,.7); }.command-feed-status[data-kind='space-weather'] { background:var(--amber); box-shadow:0 0 10px rgba(244,189,72,.7); }.command-feed-copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:5px; }.command-feed-copy strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#f2f8ff; font-size:.88rem; font-weight:650; }.command-feed-copy span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.57rem; letter-spacing:.04em; }.command-feed-copy small { color:var(--muted); font-family:'Audiowide',ui-monospace,monospace; font-size:.58rem; letter-spacing:.04em; line-height:1.45; }.command-empty,.command-error { margin:auto 0; padding:20px 0; color:var(--muted); font-size:.85rem; line-height:1.5; }.command-error { margin:0; padding:0 0 14px; color:#f5aba4; font-size:.73rem; }
        .command-telemetry { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid var(--line); border-top:0; background:rgba(2,6,13,.94); }.command-telemetry > div { min-height:76px; padding:17px 22px; border-right:1px solid var(--line); }.command-telemetry > div:last-child { border-right:0; }.command-telemetry span { display:block; margin-bottom:8px; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; }.command-telemetry strong { color:#dce8f6; font-size:.86rem; font-weight:550; }
        @media (max-width:900px) { .command-page { padding:18px 14px 28px; }.command-stage { grid-template-columns:1fr; }.command-globe-wrap { min-height:500px; }.command-feed { border-left:0; border-top:1px solid var(--line); padding:22px; max-height:none; }.command-telemetry { grid-template-columns:1fr; }.command-telemetry > div { border-right:0; border-bottom:1px solid var(--line); min-height:64px; }.command-telemetry > div:last-child { border-bottom:0; } }
        @media (max-width:560px) { .command-header { align-items:flex-start; flex-direction:column; gap:16px; }.command-actions { width:100%; justify-content:space-between; }.command-globe-wrap { min-height:420px; }.command-layer-panel { top:15px; left:15px; width:min(215px,calc(100% - 30px)); }.command-globe-caption { left:16px; right:16px; bottom:15px; gap:8px 12px; }.command-globe-caption b { padding-left:12px; }.command-feed { padding:18px; }.command-feed-row { padding:17px 0; } }
      `}</style>
    </main>
  )
}
