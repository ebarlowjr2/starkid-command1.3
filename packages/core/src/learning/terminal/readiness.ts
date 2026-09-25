// Launch readiness report — the engine behind the capstone `verify-launch.sh`.
//
// This is a FEEDBACK tool, not a grader. It reports GO/NO-GO for each launch
// subsystem by re-running the mission's own validators against the live
// EmulatorState, so its verdict can never diverge from how the mission is
// actually graded (see validators.ts / playerValidation.ts). It never marks
// completion or mutates state.

import { runValidators } from './validators'
import type { EmulatorState, LaunchReadinessSpec } from './types'

export interface LaunchReadinessResult {
  /** Formatted multi-line report for the terminal. */
  text: string
  /** True when every subsystem reports GO. */
  allGo: boolean
}

const DEFAULT_TITLE = 'AURORA FINAL LAUNCH READINESS'
const DEFAULT_GO = 'ALL STATIONS GO'
const DEFAULT_HOLD = 'LAUNCH STATUS: HOLD'

/**
 * Build the launch-readiness report for the given state. A subsystem is GO only
 * when all of its validators pass. Output intentionally reveals only the
 * affected subsystem on a HOLD — never the specific fix (Section: capstone).
 */
export function buildLaunchReadinessReport(
  state: EmulatorState,
  spec: LaunchReadinessSpec
): LaunchReadinessResult {
  const rows = spec.subsystems.map((s) => ({
    label: s.label,
    go: runValidators(state, s.validators).every((r) => r.passed),
  }))
  const allGo = rows.every((r) => r.go)
  const width = rows.reduce((m, r) => Math.max(m, r.label.length), 0)
  const lines = rows.map((r) => {
    const dots = '.'.repeat(Math.max(3, width + 4 - r.label.length))
    return `${r.label} ${dots} ${r.go ? 'GO' : 'NO-GO'}`
  })
  const footer = allGo ? spec.goLine || DEFAULT_GO : spec.holdLine || DEFAULT_HOLD
  const text = [spec.title || DEFAULT_TITLE, '', ...lines, '', footer].join('\n')
  return { text, allGo }
}
