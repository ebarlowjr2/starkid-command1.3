import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Globe from '../components/Globe.jsx'
import { getLaunchAlerts, getSolarActivity, getUpcomingLaunches } from '@starkid/core'

const REFRESH_INTERVAL_MS = 30 * 60 * 1000

function formatNet(net) {
  if (!net) return 'NET TBD'
  const date = new Date(net)
  if (Number.isNaN(date.getTime())) return 'NET TBD'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(date)
}

function statusTone(launch) {
  const value = String(launch?.status?.abbrev || launch?.status?.name || 'TBD').toLowerCase()
  if (value.includes('go') || value.includes('success')) return 'go'
  if (value.includes('hold') || value.includes('delay')) return 'hold'
  return 'pending'
}

function LaunchRow({ launch }) {
  return (
    <article className="command-launch-row">
      <span className="command-launch-status" data-tone={statusTone(launch)} />
      <div className="command-launch-copy">
        <strong>{launch?.name || 'Mission details updating'}</strong>
        <span>{launch?.launch_service_provider?.name || launch?.providerName || 'Launch provider pending'}</span>
        <small>NET {formatNet(launch?.net || launch?.window_start)}</small>
      </div>
    </article>
  )
}

export default function CommandCenterPage() {
  const [launches, setLaunches] = useState([])
  const [solar, setSolar] = useState(null)
  const [launchAlerts, setLaunchAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [resetSignal, setResetSignal] = useState(0)

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      getUpcomingLaunches({ limit: 8 }),
      getSolarActivity({ days: 3 }),
      getLaunchAlerts(),
    ])
    const launchResult = results[0]
    if (launchResult.status === 'fulfilled') {
      setLaunches(Array.isArray(launchResult.value?.data) ? launchResult.value.data : [])
      setError(null)
    } else {
      setError('Launch telemetry is temporarily unavailable. Retry shortly.')
    }
    if (results[1].status === 'fulfilled') setSolar(results[1].value?.data || null)
    if (results[2].status === 'fulfilled') setLaunchAlerts(results[2].value?.data || [])
    setUpdatedAt(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = window.setInterval(load, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [load])

  const urgentAlertCount = useMemo(
    () => launchAlerts.filter((alert) => /24h|launch/i.test(alert?.title || '')).length,
    [launchAlerts]
  )

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
          <Globe resetSignal={resetSignal} />
          <div className="command-globe-shade" aria-hidden="true" />
          <div className="command-globe-caption">
            <span><i /> System status</span>
            <b>All systems nominal</b>
            <b>Data refresh: 30 min</b>
            <b>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Initializing data link'}</b>
          </div>
        </div>

        <aside className="command-feed" aria-label="Next launches">
          <div className="command-feed-heading"><div><h2>Next launches</h2><span /></div></div>
          {loading ? <div className="command-empty">Acquiring launch telemetry...</div> : null}
          {error ? <div className="command-error">{error}</div> : null}
          {!loading && !error && launches.length === 0 ? <div className="command-empty">No launches are currently scheduled in the feed.</div> : null}
          {!loading && !error ? launches.slice(0, 5).map((launch, index) => <LaunchRow key={launch?.id || `${launch?.name || 'launch'}-${index}`} launch={launch} />) : null}
        </aside>
      </section>

      <section className="command-telemetry" aria-label="Mission telemetry">
        <div><span>Solar activity</span><strong>{solar?.strongestClass ? `Class ${solar.strongestClass}` : 'Nominal'}</strong></div>
        <div><span>Launch alerts</span><strong>{urgentAlertCount ? `${urgentAlertCount} window${urgentAlertCount === 1 ? '' : 's'} within 24h` : 'No urgent windows'}</strong></div>
        <div><span>Mission feed</span><strong>{launches.length ? `${launches.length} upcoming missions tracked` : 'Awaiting mission telemetry'}</strong></div>
      </section>

      <style>{`
        .command-page { --line:rgba(61,235,255,.28); --cyan:#3debff; --muted:#8ca1b9; max-width:1480px; margin:0 auto; padding:24px 28px 36px; color:#eaf2ff; }
        .command-header { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding:0 0 22px; border-bottom:1px solid var(--line); }
        .command-header h1 { margin:0; font-family:'Audiowide',ui-monospace,monospace; font-size:clamp(1.35rem,2.2vw,2rem); font-weight:400; letter-spacing:.06em; text-transform:uppercase; }
        .command-header p { margin:8px 0 0; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.72rem; letter-spacing:.17em; text-transform:uppercase; }
        .command-actions { display:flex; align-items:center; gap:12px; }.command-reset { border:1px solid rgba(61,235,255,.55); background:transparent; color:var(--cyan); padding:11px 14px; font-family:'Audiowide',ui-monospace,monospace; font-size:.68rem; letter-spacing:.09em; text-transform:uppercase; cursor:pointer; transition:background .2s,color .2s; }.command-reset:hover { background:var(--cyan); color:#03101a; }
        .command-live { display:flex; align-items:center; gap:8px; padding:11px 13px; color:#f4bd48; border:1px solid rgba(244,189,72,.65); font-family:'Audiowide',ui-monospace,monospace; font-size:.68rem; letter-spacing:.12em; text-transform:uppercase; }.command-live i,.command-globe-caption i { width:8px; height:8px; border-radius:50%; background:#f4bd48; box-shadow:0 0 12px rgba(244,189,72,.9); }
        .command-stage { display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,.39fr); min-height:clamp(560px,68vh,760px); background:radial-gradient(circle at 35% 28%,#102b4b 0%,#06111e 34%,#02060d 77%); border:1px solid var(--line); border-top:0; overflow:hidden; }.command-globe-wrap { position:relative; min-height:560px; overflow:hidden; background:#02060d; }.command-globe-wrap canvas { filter:saturate(.88) contrast(1.08) brightness(.9); }.command-globe-shade { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 48% 50%,transparent 30%,rgba(2,6,13,.1) 56%,rgba(2,6,13,.75) 100%); }
        .command-globe-caption { position:absolute; left:26px; right:26px; bottom:22px; display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; color:#9fb4c8; font-size:.72rem; letter-spacing:.04em; }.command-globe-caption span { display:flex; align-items:center; gap:8px; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; text-transform:uppercase; font-size:.62rem; }.command-globe-caption i { background:var(--cyan); box-shadow:0 0 12px rgba(61,235,255,.8); }.command-globe-caption b { font-weight:500; padding-left:18px; border-left:1px solid rgba(159,180,200,.38); }
        .command-feed { display:flex; flex-direction:column; background:linear-gradient(180deg,rgba(3,10,18,.92),rgba(2,6,13,.98)); border-left:1px solid var(--line); padding:28px; }.command-feed-heading { padding-bottom:20px; }.command-feed-heading h2 { margin:0; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.86rem; letter-spacing:.13em; text-transform:uppercase; font-weight:400; }.command-feed-heading span { display:block; width:30px; height:2px; background:var(--cyan); margin-top:14px; }
        .command-launch-row { display:flex; gap:13px; align-items:flex-start; padding:20px 0; border-top:1px solid rgba(61,235,255,.28); }.command-launch-status { width:7px; height:7px; flex:0 0 auto; margin-top:7px; border-radius:50%; background:#55d7f0; box-shadow:0 0 10px rgba(85,215,240,.65); }.command-launch-status[data-tone='go'] { background:#f4bd48; box-shadow:0 0 10px rgba(244,189,72,.65); }.command-launch-status[data-tone='hold'] { background:#fb7a73; box-shadow:0 0 10px rgba(251,122,115,.65); }.command-launch-copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:5px; }.command-launch-copy strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#f2f8ff; font-size:.93rem; font-weight:650; }.command-launch-copy span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.61rem; letter-spacing:.04em; }.command-launch-copy small { color:var(--muted); font-family:'Audiowide',ui-monospace,monospace; font-size:.6rem; letter-spacing:.05em; }.command-empty,.command-error { margin:auto 0; padding:20px 0; color:var(--muted); font-size:.85rem; line-height:1.5; }.command-error { color:#f5aba4; }
        .command-telemetry { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid var(--line); border-top:0; background:rgba(2,6,13,.94); }.command-telemetry > div { min-height:76px; padding:17px 22px; border-right:1px solid var(--line); }.command-telemetry > div:last-child { border-right:0; }.command-telemetry span { display:block; margin-bottom:8px; color:var(--cyan); font-family:'Audiowide',ui-monospace,monospace; font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; }.command-telemetry strong { color:#dce8f6; font-size:.86rem; font-weight:550; }
        @media (max-width:900px) { .command-page { padding:18px 14px 28px; }.command-stage { grid-template-columns:1fr; }.command-globe-wrap { min-height:440px; }.command-feed { border-left:0; border-top:1px solid var(--line); padding:22px; }.command-telemetry { grid-template-columns:1fr; }.command-telemetry > div { border-right:0; border-bottom:1px solid var(--line); min-height:64px; }.command-telemetry > div:last-child { border-bottom:0; } }
        @media (max-width:560px) { .command-header { align-items:flex-start; flex-direction:column; gap:16px; }.command-actions { width:100%; justify-content:space-between; }.command-globe-wrap { min-height:380px; }.command-globe-caption { left:16px; right:16px; bottom:15px; gap:8px 12px; }.command-globe-caption b { padding-left:12px; }.command-feed { padding:18px; }.command-launch-row { padding:17px 0; } }
      `}</style>
    </main>
  )
}
