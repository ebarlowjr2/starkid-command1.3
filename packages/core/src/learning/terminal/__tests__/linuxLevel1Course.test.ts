import { describe, expect, test } from 'vitest'
import { linuxLevel1Course } from '../../seeds/linuxLevel1Course'
import { createEmulator, runCommand } from '../emulator'
import { evaluateMission } from '../validators'
import { buildLaunchReadinessReport } from '../readiness'
import type { TerminalMission } from '../types'

const blocks = linuxLevel1Course.blocks as any[]
const missionBlocks = blocks.filter((b) => b.type === 'terminal_mission')
const missionsById = new Map<string, TerminalMission>(
  missionBlocks.map((b) => [b.mission.id, b.mission as TerminalMission])
)

function solve(mission: TerminalMission, cmds: string[]) {
  const state = cmds.reduce((s, c) => runCommand(s, c).state, createEmulator(mission.init))
  return evaluateMission(state, mission)
}

describe('Linux Level I — course shape', () => {
  test('is a published course with eight terminal missions', () => {
    expect(linuxLevel1Course.status).toBe('published')
    expect(linuxLevel1Course.slug).toBe('linux-level-1-prepare-for-launch')
    expect(missionBlocks.length).toBe(8)
  })

  test('opens with a brief and ends with the launch sequence', () => {
    expect(blocks[0].type).toBe('mission_brief')
    expect(blocks[blocks.length - 1].type).toBe('launch_sequence')
    expect(blocks[blocks.length - 1].requiresBlockId).toBe('block-linux-l1-m8-launch')
  })

  test('awards a Level I badge and XP', () => {
    expect(linuxLevel1Course.rewards?.badgeId).toBeTruthy()
    expect((linuxLevel1Course.rewards?.xp ?? 0)).toBeGreaterThan(0)
  })
})

describe('every mission is unsolved from its fresh state', () => {
  for (const b of missionBlocks) {
    test(`${b.mission.id} fresh state is incomplete`, () => {
      const evaluation = evaluateMission(createEmulator(b.mission.init), b.mission)
      expect(evaluation.passed).toBe(false)
    })
  }
})

describe('representative missions are solvable with real commands', () => {
  test('Mission 1 — report in (files + redirection)', () => {
    const m = missionsById.get('linux-l1-m1-report')!
    expect(solve(m, [
      'echo ACKNOWLEDGED > ack.txt',
      'echo CADET-01 > /ops/launch/checkin.txt',
    ]).passed).toBe(true)
  })

  test('Mission 4 — assemble the crew (users + groups)', () => {
    const m = missionsById.get('linux-l1-m4-crew')!
    expect(solve(m, [
      'groupadd flightcrew',
      'useradd commander', 'useradd pilot', 'useradd engineer',
      'usermod -aG flightcrew commander',
      'usermod -aG flightcrew pilot',
      'usermod -aG flightcrew engineer',
    ]).passed).toBe(true)
  })

  test('Mission 5 — secure the keys (ownership + permissions)', () => {
    const m = missionsById.get('linux-l1-m5-keys')!
    expect(solve(m, [
      'chown commander launch.key', 'chgrp flightcrew launch.key', 'chmod 600 launch.key',
      'chown pilot abort.key', 'chgrp flightcrew abort.key', 'chmod 640 abort.key',
    ]).passed).toBe(true)
  })
})

describe('Mission 8 — capstone troubleshooting + launch readiness', () => {
  const mission = missionsById.get('linux-l1-m8-launch')!

  test('fresh state fails and the readiness report holds', () => {
    const state = createEmulator(mission.init)
    expect(evaluateMission(state, mission).passed).toBe(false)
    const report = buildLaunchReadinessReport(state, mission.readiness!)
    expect(report.allGo).toBe(false)
    expect(report.text).toContain('LAUNCH STATUS: HOLD')
    // The three pre-satisfied stations report GO even in the fresh state.
    expect(report.text).toMatch(/Navigation .* GO/)
    expect(report.text).toMatch(/Mission Processes .* GO/)
  })

  test('correcting every fault passes the mission and clears all stations', () => {
    const state = [
      'usermod -aG flightcrew engineer',
      'chmod 640 launch/ignition.key',
      'echo AURORA PRE-FLIGHT CHECKLIST > preflight.txt',
      'echo GUIDANCE: GO >> preflight.txt',
      'echo TELEMETRY: GO >> preflight.txt',
      'echo FUEL: GO >> preflight.txt',
      'mv diagnostic.log.bak telemetry/diagnostic.log',
      'echo ARMED > launch/authorization',
    ].reduce((s, c) => runCommand(s, c).state, createEmulator(mission.init))

    expect(evaluateMission(state, mission).passed).toBe(true)
    const report = buildLaunchReadinessReport(state, mission.readiness!)
    expect(report.allGo).toBe(true)
    expect(report.text).toContain('ALL STATIONS GO')
    expect(report.text).not.toContain('NO-GO')
  })

  test('has a verify-launch.sh readiness spec whose stations map to its faults', () => {
    expect(mission.readiness?.scriptName).toBe('verify-launch.sh')
    const labels = (mission.readiness?.subsystems || []).map((s) => s.label)
    expect(labels).toEqual(
      expect.arrayContaining(['Flight Crew', 'Security', 'Launch Checklist', 'Flight Computer', 'Ignition'])
    )
  })
})
