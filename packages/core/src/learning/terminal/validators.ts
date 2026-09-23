// Deterministic mission validators.
//
// Core principle (Section 29): grade the RESULTING SYSTEM STATE, not the
// commands the student typed. Any sequence of valid commands that produces the
// required state passes (Section 30). Every validator returns a
// student-friendly message so the mission panel can explain what's left to do.

import { getNode, normalizePath } from './emulator'
import type {
  EmulatorState,
  TerminalMission,
  TerminalTask,
  Validator,
  ValidatorResult,
} from './types'

function resolve(state: EmulatorState, path?: string) {
  if (!path) return null
  const abs = normalizePath(state.cwd, path, state.home)
  return { abs, node: getNode(state.fs, abs) }
}

function fail(v: Validator, fallback: string): ValidatorResult {
  return { type: v.type, passed: false, message: v.failureMessage || fallback }
}

function pass(v: Validator, fallback: string): ValidatorResult {
  return { type: v.type, passed: true, message: v.successMessage || fallback }
}

export function runValidator(state: EmulatorState, v: Validator): ValidatorResult {
  switch (v.type) {
    case 'cwd_is': {
      const want = v.path ? normalizePath('/', v.path, state.home) : ''
      return state.cwd === want
        ? pass(v, `You are in ${want}.`)
        : fail(v, `Navigate to ${want} (currently ${state.cwd}).`)
    }

    case 'directory_exists': {
      const r = resolve(state, v.path)
      return r?.node?.type === 'dir'
        ? pass(v, `Directory ${v.path} exists.`)
        : fail(v, `Directory ${v.path} does not exist yet.`)
    }

    case 'file_exists': {
      const r = resolve(state, v.path)
      return r?.node?.type === 'file'
        ? pass(v, `File ${v.path} exists.`)
        : fail(v, `File ${v.path} does not exist yet.`)
    }

    case 'file_contains': {
      const r = resolve(state, v.path)
      if (r?.node?.type !== 'file') return fail(v, `File ${v.path} does not exist yet.`)
      const content = r.node.content ?? ''
      const needles = v.contains ?? (v.text ? [v.text] : [])
      const missing = needles.filter((n) => !content.includes(n))
      return missing.length === 0
        ? pass(v, `${v.path} contains the required content.`)
        : fail(v, `${v.path} is missing: ${missing.join(', ')}.`)
    }

    case 'exact_content': {
      const r = resolve(state, v.path)
      if (r?.node?.type !== 'file') return fail(v, `File ${v.path} does not exist yet.`)
      const actual = (r.node.content ?? '').trim()
      const want = (v.text ?? '').trim()
      return actual === want
        ? pass(v, `${v.path} has the exact required content.`)
        : fail(v, `${v.path} content does not match what's required.`)
    }

    case 'owner_matches': {
      const r = resolve(state, v.path)
      if (!r?.node) return fail(v, `${v.path} does not exist yet.`)
      return r.node.owner === v.user
        ? pass(v, `${v.path} is owned by ${v.user}.`)
        : fail(v, `${v.path} must be owned by ${v.user} (currently ${r.node.owner}).`)
    }

    case 'group_matches': {
      const r = resolve(state, v.path)
      if (!r?.node) return fail(v, `${v.path} does not exist yet.`)
      return r.node.group === v.group
        ? pass(v, `${v.path} group is ${v.group}.`)
        : fail(v, `${v.path} must belong to group ${v.group} (currently ${r.node.group}).`)
    }

    case 'permissions_match': {
      const r = resolve(state, v.path)
      if (!r?.node) return fail(v, `${v.path} does not exist yet.`)
      const actual = r.node.mode & 0o777
      const want = (v.mode ?? 0) & 0o777
      return actual === want
        ? pass(v, `${v.path} permissions are correct.`)
        : fail(
            v,
            `${v.path} permissions must be ${want.toString(8).padStart(3, '0')} (currently ${actual
              .toString(8)
              .padStart(3, '0')}).`
          )
    }

    case 'user_exists': {
      return v.user && state.users[v.user]
        ? pass(v, `User ${v.user} exists.`)
        : fail(v, `Create the user ${v.user}.`)
    }

    case 'group_exists': {
      return v.group && state.groups[v.group]
        ? pass(v, `Group ${v.group} exists.`)
        : fail(v, `Create the group ${v.group}.`)
    }

    case 'user_in_group': {
      const user = v.user ? state.users[v.user] : undefined
      const inGroup =
        !!user &&
        !!v.group &&
        (user.groups.includes(v.group) || state.groups[v.group]?.members.includes(v.user!))
      return inGroup
        ? pass(v, `${v.user} is a member of ${v.group}.`)
        : fail(v, `Add ${v.user} to the ${v.group} group.`)
    }

    case 'process_running': {
      const running = state.processes.some((p) => v.process && p.command.includes(v.process))
      return running
        ? pass(v, `Process ${v.process} is running.`)
        : fail(v, `Process ${v.process} is not running.`)
    }

    case 'command_output_matches': {
      // Reserved for output-based checks captured by the UI; state-only here.
      return v.text
        ? fail(v, `Run the command that produces: ${v.text}`)
        : pass(v, 'Output verified.')
    }

    case 'script_exit_code': {
      const want = v.exitCode ?? 0
      return state.lastExitCode === want
        ? pass(v, `Last command exited with ${want}.`)
        : fail(v, `Expected exit code ${want} (last was ${state.lastExitCode}).`)
    }

    default:
      return fail(v as Validator, 'Unknown validator.')
  }
}

export function runValidators(state: EmulatorState, validators: Validator[]): ValidatorResult[] {
  return validators.map((v) => runValidator(state, v))
}

export interface TaskEvaluation {
  taskId: string
  passed: boolean
  results: ValidatorResult[]
}

export function evaluateTask(state: EmulatorState, task: TerminalTask): TaskEvaluation {
  const results = runValidators(state, task.validators)
  return { taskId: task.id, passed: results.every((r) => r.passed), results }
}

export interface MissionEvaluation {
  missionId: string
  passed: boolean
  tasks: TaskEvaluation[]
  /** Task ids that are complete — drives progress + system status flips. */
  completedTaskIds: string[]
}

export function evaluateMission(state: EmulatorState, mission: TerminalMission): MissionEvaluation {
  const tasks = mission.tasks.map((t) => evaluateTask(state, t))
  const completedTaskIds = tasks.filter((t) => t.passed).map((t) => t.taskId)
  return {
    missionId: mission.id,
    passed: tasks.every((t) => t.passed),
    tasks,
    completedTaskIds,
  }
}
