// Terminal backend abstraction for Linux Mission Training.
//
// PHASE 1 (this file): a custom React terminal renders against the pure,
// line-based StarKid Linux emulator in packages/core (`command -> CommandResult`).
// The emulator's immutable EmulatorState is the single source of truth and drives
// deterministic, state-based mission validation.
//
// FUTURE PHASE: swap the backend for a real Linux session
// (xterm.js -> WebSocket -> PTY -> isolated container) WITHOUT touching the
// Terminal component or the mission UI. Anything implementing `TerminalBackend`
// below is a drop-in replacement. The one Phase-1 assumption a PTY backend must
// preserve is `getSnapshot()`: it must return whatever object the mission's
// validators grade against (today: an EmulatorState). A PTY backend would supply
// an equivalent state probe (e.g. the result of a state-capture script).
//
// Honesty rule: this backend only exposes what the emulator actually supports —
// discrete command execution with combined stdout/stderr text and an exit code.
// There is no cursor addressing, no interactive programs (top/less/vi), no raw
// PTY stream. The Terminal UI must not pretend otherwise.

import { createEmulator, runCommand, buildLaunchReadinessReport } from '@starkid/core'

/**
 * Does this input line invoke the mission's readiness script?
 * Accepts `./name`, `name`, and `sh|bash [./]name` forms.
 * @param {string} input
 * @param {string} scriptName
 */
function invokesScript(input, scriptName) {
  const trimmed = (input || '').trim()
  const forms = [scriptName, `./${scriptName}`]
  if (forms.includes(trimmed)) return true
  const m = trimmed.match(/^(?:sh|bash)\s+(.+)$/)
  return !!m && forms.includes(m[1].trim())
}

/**
 * @typedef {Object} TerminalRunResult
 * @property {string} output   Combined stdout/stderr text for this command.
 * @property {boolean} [clear] When true, the UI should clear its scrollback.
 * @property {number} exitCode Exit status of the command (0 == success).
 *
 * @typedef {Object} TerminalBackend
 * @property {() => string} getPrompt      Current shell prompt, e.g. "cadet@starkid:~$".
 * @property {(input: string) => TerminalRunResult} run  Execute one command line.
 * @property {() => any} getSnapshot       Opaque state object for mission validators.
 * @property {() => void} reset            Restore the mission's initial state.
 */

/**
 * Render the display form of a working directory: collapse the home dir to `~`.
 * @param {{ cwd: string, home?: string }} state
 */
function displayCwd(state) {
  const home = state.home || '/root'
  if (state.cwd === home) return '~'
  if (state.cwd.startsWith(home + '/')) return '~' + state.cwd.slice(home.length)
  return state.cwd
}

/**
 * Create an emulator-backed terminal backend for a mission.
 *
 * @param {import('@starkid/core').TerminalMission} mission
 * @param {import('@starkid/core').EmulatorState} [initialState]
 *   Optional saved snapshot to resume from (e.g. hydrated lesson progress).
 *   When omitted, the mission starts from `mission.init`. `reset()` always
 *   returns to `mission.init`, never to this resumed state.
 * @returns {TerminalBackend}
 */
export function createEmulatorBackend(mission, initialState) {
  const init = (mission && mission.init) || {}
  let state = initialState || createEmulator(init)

  return {
    getPrompt() {
      return `${state.user}@${state.hostname}:${displayCwd(state)}$`
    },
    run(input) {
      // Capstone diagnostic: `verify-launch.sh` is a real, readable file seeded
      // in the mission, but it is not a program the line-based emulator can
      // execute. Intercept it here and report GO/NO-GO from the live state using
      // the mission's own validators. This is feedback only — grading still runs
      // through evaluateMission on the snapshot (see TerminalMissionBlock).
      const readiness = mission && mission.readiness
      if (readiness && readiness.scriptName && invokesScript(input, readiness.scriptName)) {
        const report = buildLaunchReadinessReport(state, readiness)
        return { output: report.text + '\n', exitCode: report.allGo ? 0 : 1 }
      }
      const res = runCommand(state, input)
      state = res.state
      return { output: res.output ?? '', clear: res.clear, exitCode: res.exitCode }
    },
    getSnapshot() {
      return state
    },
    reset() {
      state = createEmulator(init)
    },
  }
}
