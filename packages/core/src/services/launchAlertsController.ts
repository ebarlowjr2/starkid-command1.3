import { onAuthChange } from '../auth/service'
import { DEFAULT_LAUNCH_ALERT_PREFERENCES } from './launchAlertRules'
import { getLaunchAlertsState, launchAlertsEnabled, saveLaunchAlertPreferences, watchLaunch } from './launchAlertsService'
import type { LaunchAlertsState } from './launchAlertsService'
import type { LaunchAlertPreferences } from './launchAlertRules'

type State = LaunchAlertsState & { loading: boolean; busy: boolean; error: string | null }
export function createLaunchAlertsController(deps = { getLaunchAlertsState, saveLaunchAlertPreferences, watchLaunch, onAuthChange, launchAlertsEnabled }) {
  const initial = (): State => ({ userId: null, preferences: { ...DEFAULT_LAUNCH_ALERT_PREFERENCES, reminder_minutes: [60, 10] }, subscriptions: [], loading: true, busy: false, error: null })
  let state = initial()
  let generation = 0
  let readVersion = 0
  let unlisten: (() => void) | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const listeners = new Set<() => void>()
  const publish = (value: Partial<State>) => { state = { ...state, ...value }; listeners.forEach((fn) => fn()) }
  const refresh = async () => {
    const version = ++readVersion
    const account = generation
    try {
      const result = await deps.getLaunchAlertsState()
      if (version === readVersion && account === generation) publish({ ...result, error: null, loading: false })
    } catch {
      if (version === readVersion && account === generation) publish({ error: 'Unable to load launch notifications. Check your connection and retry.', loading: false })
    }
  }
  const change = async (action: () => Promise<unknown>) => {
    if (state.busy || !state.userId) return false
    const account = generation
    publish({ busy: true, error: null })
    try {
      await action()
      if (account !== generation) return false
      await refresh()
      return !state.error
    } catch (error: any) {
      if (account === generation) publish({ error: error?.message || 'Unable to save launch notifications.' })
      return false
    } finally { if (account === generation) publish({ busy: false }) }
  }
  return {
    getSnapshot: () => state,
    subscribe(fn: () => void) {
      listeners.add(fn)
      if (listeners.size === 1 && deps.launchAlertsEnabled()) {
        void refresh()
        unlisten = deps.onAuthChange((session) => {
          if (session?.userId === state.userId) return
          ++generation; ++readVersion
          state = initial(); publish({})
          // Supabase's auth event callback holds its auth lock.
          clearTimeout(timer); timer = setTimeout(() => { void refresh() }, 0)
        })
      }
      return () => {
        listeners.delete(fn)
        if (!listeners.size) { ++generation; ++readVersion; unlisten?.(); clearTimeout(timer); state = { ...state, busy: false } }
      }
    },
    refresh,
    savePreferences: (value: LaunchAlertPreferences) => change(() => deps.saveLaunchAlertPreferences(value)),
    setWatch: (id: string, name: string, active: boolean) => change(() => deps.watchLaunch(id, name, active)),
  }
}
export const launchAlertsController = createLaunchAlertsController()
