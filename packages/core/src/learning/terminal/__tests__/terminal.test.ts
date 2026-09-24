import { describe, expect, test } from 'vitest'
import { createEmulator, runCommand, getNode } from '../emulator'
import { runValidator, evaluateMission } from '../validators'
import { buildLaunchReadinessReport } from '../readiness'
import type { EmulatorInit, TerminalMission } from '../types'

const HOME = '/home/cadet'
const base: EmulatorInit = { user: 'cadet', home: HOME, cwd: HOME }

function run(state: any, cmds: string[]) {
  return cmds.reduce((s, c) => runCommand(s, c).state, state)
}

describe('emulator — filesystem commands', () => {
  test('mkdir then redirect create the expected nodes', () => {
    const s = run(createEmulator(base), ['mkdir bay', 'echo ARMED > bay/authorization'])
    expect(getNode(s.fs, `${HOME}/bay`)?.type).toBe('dir')
    expect(getNode(s.fs, `${HOME}/bay/authorization`)?.content).toContain('ARMED')
  })

  test('append (>>) preserves earlier content', () => {
    const s = run(createEmulator(base), ['echo one > f.txt', 'echo two >> f.txt'])
    const content = getNode(s.fs, `${HOME}/f.txt`)?.content || ''
    expect(content).toContain('one')
    expect(content).toContain('two')
  })

  test('mv relocates and renames a file with its content', () => {
    const init: EmulatorInit = {
      ...base,
      cwd: '/w',
      files: [
        { path: '/w/diagnostic.log.bak', content: 'FLIGHT-COMPUTER DIAGNOSTIC\n' },
        { path: '/w/telemetry', type: 'dir', owner: 'cadet', group: 'cadet' },
      ],
    }
    const s = run(createEmulator(init), ['mv diagnostic.log.bak telemetry/diagnostic.log'])
    expect(getNode(s.fs, '/w/diagnostic.log.bak')).toBeFalsy()
    expect(getNode(s.fs, '/w/telemetry/diagnostic.log')?.content).toContain('FLIGHT-COMPUTER DIAGNOSTIC')
  })

  test('ps | grep filters process output', () => {
    const init: EmulatorInit = {
      ...base,
      processes: [
        { pid: 1, user: 'root', command: '/sbin/init' },
        { pid: 2, user: 'cadet', command: 'telemetry-daemon' },
      ],
    }
    const res = runCommand(createEmulator(init), 'ps | grep telemetry')
    expect(res.output).toContain('telemetry-daemon')
    expect(res.output).not.toContain('/sbin/init')
  })
})

describe('emulator — immutability (state isolation within a session)', () => {
  test('runCommand never mutates the input state', () => {
    const s0 = createEmulator(base)
    const s1 = runCommand(s0, 'mkdir created').state
    expect(getNode(s0.fs, `${HOME}/created`)).toBeFalsy()
    expect(getNode(s1.fs, `${HOME}/created`)?.type).toBe('dir')
  })
})

describe('cross-session isolation (one cadet cannot affect another)', () => {
  test('two sessions from the same init do not share filesystem state', () => {
    const a0 = createEmulator(base)
    const b0 = createEmulator(base)
    const a1 = runCommand(a0, 'mkdir only-a').state
    const b1 = runCommand(b0, 'echo x > only-b.txt').state

    // Neither session sees the other's writes.
    expect(getNode(a1.fs, `${HOME}/only-a`)?.type).toBe('dir')
    expect(getNode(b1.fs, `${HOME}/only-a`)).toBeFalsy()
    expect(getNode(b1.fs, `${HOME}/only-b.txt`)?.content).toContain('x')
    expect(getNode(a1.fs, `${HOME}/only-b.txt`)).toBeFalsy()
  })

  test('two sessions have independent user/group tables', () => {
    const init: EmulatorInit = {
      ...base,
      groups: [{ name: 'crew', gid: 1500, members: [] }],
      users: [{ name: 'eng', uid: 1, primaryGroup: 'eng', groups: ['eng'] }],
    }
    const a = runCommand(createEmulator(init), 'usermod -aG crew eng').state
    const b = createEmulator(init)
    expect(a.users['eng'].groups).toContain('crew')
    expect(b.users['eng'].groups).not.toContain('crew')
  })
})

describe('validators — permission & access control', () => {
  const init: EmulatorInit = {
    ...base,
    cwd: '/w',
    groups: [{ name: 'crew', gid: 1500, members: ['pilot'] }],
    users: [{ name: 'eng', uid: 1, primaryGroup: 'eng', groups: ['eng'] }],
    files: [{ path: '/w/ignition.key', mode: 0o644, owner: 'commander', group: 'crew', content: 'SECRET' }],
  }

  test('permissions_match flags a world-readable secret and passes once locked down', () => {
    const s = createEmulator(init)
    expect(runValidator(s, { type: 'permissions_match', path: '/w/ignition.key', mode: 0o640 }).passed).toBe(false)
    const fixed = runCommand(s, 'chmod 640 ignition.key').state
    expect(runValidator(fixed, { type: 'permissions_match', path: '/w/ignition.key', mode: 0o640 }).passed).toBe(true)
  })

  test('user_in_group detects an unauthorized/missing member and confirms the fix', () => {
    const s = createEmulator(init)
    expect(runValidator(s, { type: 'user_in_group', user: 'eng', group: 'crew' }).passed).toBe(false)
    const fixed = runCommand(s, 'usermod -aG crew eng').state
    expect(runValidator(fixed, { type: 'user_in_group', user: 'eng', group: 'crew' }).passed).toBe(true)
  })

  test('owner_matches enforces custody', () => {
    const s = createEmulator(init)
    expect(runValidator(s, { type: 'owner_matches', path: '/w/ignition.key', user: 'pilot' }).passed).toBe(false)
    expect(runValidator(s, { type: 'owner_matches', path: '/w/ignition.key', user: 'commander' }).passed).toBe(true)
  })
})

describe('grading purity', () => {
  test('a mission grades purely from its snapshot — same input, same verdict', () => {
    const mission: TerminalMission = {
      id: 'm', order: 1, title: 't', narrative: 'n',
      init: { ...base },
      tasks: [{ id: 'task', title: 'x', description: 'd', validators: [{ type: 'file_exists', path: `${HOME}/go.txt` }] }],
    }
    const before = createEmulator(mission.init)
    expect(evaluateMission(before, mission).passed).toBe(false)
    const after = runCommand(before, 'echo go > go.txt').state
    const first = evaluateMission(after, mission)
    const second = evaluateMission(after, mission)
    expect(first.passed).toBe(true)
    expect(second).toEqual(first)
  })
})

describe('launch readiness report', () => {
  test('reports NO-GO/HOLD until validators pass, then GO', () => {
    const s = createEmulator({ ...base, files: [{ path: `${HOME}/authorization`, content: 'SAFED' }] })
    const spec = {
      subsystems: [{ label: 'Ignition', validators: [{ type: 'file_contains' as const, path: `${HOME}/authorization`, text: 'ARMED' }] }],
    }
    const hold = buildLaunchReadinessReport(s, spec)
    expect(hold.allGo).toBe(false)
    expect(hold.text).toContain('NO-GO')
    expect(hold.text).toContain('LAUNCH STATUS: HOLD')

    const armed = runCommand(s, 'echo ARMED > authorization').state
    const go = buildLaunchReadinessReport(armed, spec)
    expect(go.allGo).toBe(true)
    expect(go.text).toContain('ALL STATIONS GO')
    expect(go.text).not.toContain('NO-GO')
  })
})
