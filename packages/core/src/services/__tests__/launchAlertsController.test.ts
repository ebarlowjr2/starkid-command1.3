import { describe, expect, it, vi } from 'vitest'
import { createLaunchAlertsController } from '../launchAlertsController'
const preferences = { enabled: true, reminder_minutes: [60, 10], schedule_changes: false }
const flush = () => new Promise((resolve) => setTimeout(resolve, 5))
function fixture() {
  let auth: any
  const deps = {
    getLaunchAlertsState: vi.fn().mockResolvedValue({ userId: 'user-a', preferences, subscriptions: [] }),
    saveLaunchAlertPreferences: vi.fn().mockResolvedValue(preferences), watchLaunch: vi.fn().mockResolvedValue(undefined),
    launchAlertsEnabled: () => true,
    onAuthChange: vi.fn((cb) => { auth = cb; return () => {} }),
  }
  return { deps, controller: createLaunchAlertsController(deps), auth: (userId: string) => auth({ userId }) }
}
describe('shared launch preferences controller', () => {
  it('shares one initial fetch across launch cards', async () => {
    const { controller, deps } = fixture()
    const first = controller.subscribe(() => {}); const second = controller.subscribe(() => {})
    await flush()
    expect(deps.getLaunchAlertsState).toHaveBeenCalledTimes(1)
    first(); second()
  })
  it('retains the prior preferences and shows a save failure', async () => {
    const { controller, deps } = fixture(); const stop = controller.subscribe(() => {}); await flush()
    deps.saveLaunchAlertPreferences.mockRejectedValue(new Error('Connection lost'))
    expect(await controller.savePreferences({ ...preferences, enabled: false })).toBe(false)
    expect(controller.getSnapshot().preferences.enabled).toBe(true)
    expect(controller.getSnapshot().error).toBe('Connection lost'); stop()
  })
  it('does not let an old account read overwrite the new account', async () => {
    const { controller, deps, auth } = fixture()
    let oldRead: any
    deps.getLaunchAlertsState.mockImplementationOnce(() => new Promise((resolve) => { oldRead = resolve }))
    const stop = controller.subscribe(() => {})
    deps.getLaunchAlertsState.mockResolvedValue({ userId: 'user-b', preferences, subscriptions: [] })
    auth('user-b'); await flush()
    oldRead({ userId: 'user-a', preferences, subscriptions: [] }); await flush()
    expect(controller.getSnapshot().userId).toBe('user-b'); stop()
  })
})
