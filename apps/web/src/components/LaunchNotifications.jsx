import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { launchAlertsController, launchAlertsEnabled, launchWatchSupported, getLaunchById } from '@starkid/core'
import SyncIdentityModal from './auth/SyncIdentityModal'

const button = 'min-h-[44px] rounded-lg border border-cyan-300/40 px-3 py-2 text-sm text-cyan-100 disabled:opacity-50'
function useAlerts() { return useSyncExternalStore(launchAlertsController.subscribe, launchAlertsController.getSnapshot) }
export function NotifyLaunchButton({ launch }) {
  return launchAlertsEnabled() && launchWatchSupported(launch) ? <Watch launch={launch} /> : null
}
function Watch({ launch }) {
  const state = useAlerts()
  const [auth, setAuth] = useState(false)
  const watched = state.subscriptions.some((s) => s.launch_id === launch.id)
  return <div className="mt-3">
    <button className={button} disabled={state.busy || state.loading} onClick={() => {
      if (!state.userId) setAuth(true)
      else void launchAlertsController.setWatch(String(launch.id), launch.name || 'Launch', !watched)
    }}>{state.busy ? 'Saving...' : watched ? 'Watching - stop alerts' : 'Notify Me'}</button>
    <p className="mt-2 text-xs text-slate-300">Phone reminders require notifications enabled in the StarKid mobile app.</p>
    {state.error ? <p role="alert" className="text-sm text-rose-200">{state.error}</p> : null}
    <SyncIdentityModal open={auth} onClose={() => setAuth(false)} onSync={() => { setAuth(false); void launchAlertsController.refresh() }} />
  </div>
}
export function LaunchNotificationPreferences() { return launchAlertsEnabled() ? <Preferences /> : null }
function Preferences() {
  const state = useAlerts()
  const [auth, setAuth] = useState(false)
  useEffect(() => {
    const refresh = () => { void launchAlertsController.refresh() }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])
  const prefs = state.preferences
  const save = (patch) => { void launchAlertsController.savePreferences({ ...prefs, ...patch }) }
  return <section className="mt-6 rounded-2xl border border-cyan-300/30 bg-slate-950/70 p-5">
    <h2 className="text-lg text-cyan-200">Launch Notifications</h2>
    <p className="my-3 text-sm text-slate-300">Watch launches here and enable phone notifications in the StarKid mobile app. Times and delivery may vary.</p>
    {state.loading ? <p>Loading launch preferences...</p> : !state.userId ? <button className={button} onClick={() => setAuth(true)}>Sign in to watch launches</button> : <>
      <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" disabled={state.busy} checked={prefs.enabled} onChange={() => save({ enabled: !prefs.enabled })} />Enable launch notifications</label>
      {[60, 10].map((n) => <label key={n} className="flex min-h-[44px] items-center gap-3"><input type="checkbox" disabled={state.busy} checked={prefs.reminder_minutes.includes(n)} onChange={() => save({ reminder_minutes: prefs.reminder_minutes.includes(n) ? prefs.reminder_minutes.filter((v) => v !== n) : [...prefs.reminder_minutes, n] })} />{n === 60 ? '1 hour before launch' : '10 minutes before launch'}</label>)}
      <label className="flex min-h-[44px] items-center gap-3"><input type="checkbox" disabled={state.busy} checked={prefs.schedule_changes} onChange={() => save({ schedule_changes: !prefs.schedule_changes })} />Schedule and status updates</label>
      <h3 className="mt-4 text-cyan-200">Watched launches</h3>
      {!state.subscriptions.length ? <p className="mt-2 text-sm text-slate-300">No watched launches yet. Choose Notify Me on a launch.</p> : null}
      {state.subscriptions.map((s) => <div key={s.launch_id} className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-300/20 py-3">
        <Link className="py-3 text-cyan-200 underline" to={`/command?launch=${s.launch_id}`}>{s.launch_name}</Link>
        <button className={button} disabled={state.busy} onClick={() => { void launchAlertsController.setWatch(s.launch_id, s.launch_name, false) }}>Remove</button>
      </div>)}
    </>}
    {state.error ? <><p role="alert" className="mt-3 text-rose-200">{state.error}</p><button className={button} onClick={() => { void launchAlertsController.refresh() }}>Retry</button></> : null}
    <SyncIdentityModal open={auth} onClose={() => setAuth(false)} onSync={() => { setAuth(false); void launchAlertsController.refresh() }} />
  </section>
}
export function SelectedLaunchDetails() {
  const [params, setParams] = useSearchParams()
  const id = params.get('launch')
  const [launch, setLaunch] = useState(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!id || !launchAlertsEnabled()) return
    let active = true
    setLaunch(null); setError(false)
    getLaunchById(id).then((result) => { if (active) setLaunch(result) }).catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [id, retry])
  if (!id || !launchAlertsEnabled()) return null
  return <section className="mb-5 rounded-2xl border border-cyan-300/40 bg-slate-950/80 p-5">
    <button className={button} onClick={() => { const next = new URLSearchParams(params); next.delete('launch'); setParams(next) }}>Close briefing</button>
    {error ? <><p role="alert" className="my-3">Unable to load this launch. Check your connection.</p><button className={button} onClick={() => setRetry((n) => n + 1)}>Retry</button></> : launch ? <>
      <h2 className="mt-4 text-xl text-cyan-200">{launch.name}</h2><p className="my-2">{launch.providerName} · {launch.status?.name || 'Status pending'}</p>
      <p>{launch.net ? new Date(launch.net).toLocaleString() : 'Time to be determined'}</p><p className="mt-2 text-sm text-slate-300">{launch.pad?.name} · Launch time may change.</p>
      <NotifyLaunchButton launch={launch} />
    </> : <p className="mt-3">Loading launch briefing...</p>}
  </section>
}
