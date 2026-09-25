// Terminal mission domain types.
//
// These describe the browser-emulated Linux environment used by Linux Mission
// Training. The emulator is intentionally deterministic and side-effect free so
// the same definitions can later back a real container sandbox without changing
// how missions, tasks, or validators are authored (see docs/linux-missions.md).
//
// Skills are separated from story: a mission's narrative may change while its
// tasks and validators stay constant.

export type FsNodeType = 'dir' | 'file'

export interface FsNode {
  type: FsNodeType
  /** Octal permission bits, e.g. 0o644. */
  mode: number
  /** Owning username. */
  owner: string
  /** Owning group name. */
  group: string
  /** File contents (files only). */
  content?: string
  /** Child nodes keyed by name (directories only). */
  children?: Record<string, FsNode>
  /** Last-modified epoch millis (for ls formatting). */
  mtime?: number
}

export interface UserAccount {
  name: string
  uid: number
  /** Primary group name. */
  primaryGroup: string
  /** All group names this user belongs to (including the primary group). */
  groups: string[]
}

export interface GroupAccount {
  name: string
  gid: number
  /** Member usernames (secondary membership). */
  members: string[]
}

export interface ProcessInfo {
  pid: number
  user: string
  command: string
  /** Percent CPU, for `ps`/`top`-style output. */
  cpu?: number
  /** Percent memory. */
  mem?: number
}

/**
 * A fully self-contained snapshot of the emulated machine. Every command
 * returns a new state; nothing is mutated in place, which keeps missions
 * reproducible and makes reset trivial (re-instantiate the initial state).
 */
export interface EmulatorState {
  cwd: string
  user: string
  hostname: string
  /** Home directory used to render `~` in the prompt. */
  home: string
  users: Record<string, UserAccount>
  groups: Record<string, GroupAccount>
  processes: ProcessInfo[]
  /** Root ("/") node. */
  fs: FsNode
  env: Record<string, string>
  /** Exit code of the most recent command (0 == success). */
  lastExitCode: number
}

/** Serializable description of a machine's starting state for a mission. */
export interface EmulatorInit {
  cwd?: string
  user?: string
  hostname?: string
  home?: string
  users?: UserAccount[]
  groups?: GroupAccount[]
  processes?: ProcessInfo[]
  env?: Record<string, string>
  /**
   * Files/dirs to create before the mission starts, in order. Paths are
   * absolute. Intermediate directories are created as needed.
   */
  files?: Array<{
    path: string
    type?: FsNodeType
    content?: string
    mode?: number
    owner?: string
    group?: string
  }>
}

export interface CommandResult {
  state: EmulatorState
  /** Stdout/stderr text to append to the terminal. */
  output: string
  /** Exit code for this command. */
  exitCode: number
  /** When true, the UI should clear the terminal buffer (e.g. `clear`). */
  clear?: boolean
}

// ---------------------------------------------------------------------------
// Validators — grade resulting SYSTEM STATE, never the commands typed.
// ---------------------------------------------------------------------------

export type ValidatorType =
  | 'directory_exists'
  | 'file_exists'
  | 'file_contains'
  | 'exact_content'
  | 'owner_matches'
  | 'group_matches'
  | 'permissions_match'
  | 'user_exists'
  | 'group_exists'
  | 'user_in_group'
  | 'process_running'
  | 'cwd_is'
  | 'command_output_matches'
  | 'script_exit_code'

export interface Validator {
  type: ValidatorType
  /** Absolute path the check targets (for fs/permission checks). */
  path?: string
  /** Username (for user checks / owner_matches). */
  user?: string
  /** Group name (for group checks / group_matches). */
  group?: string
  /** Expected octal mode (for permissions_match), e.g. 0o600. */
  mode?: number
  /** Substring/exact text (for file_contains / exact_content). */
  text?: string
  /** Lines that must all be present (for file_contains, order-independent). */
  contains?: string[]
  /** Process command substring (for process_running). */
  process?: string
  /** Expected exit code (for script_exit_code). */
  exitCode?: number
  /** Friendly explanation shown to the student when this check fails. */
  failureMessage?: string
  /** Friendly explanation shown when this check passes. */
  successMessage?: string
}

export interface ValidatorResult {
  type: ValidatorType
  passed: boolean
  message: string
}

// ---------------------------------------------------------------------------
// Progressive hints (Section 31) — reveal information gradually.
// ---------------------------------------------------------------------------

export interface Hint {
  /** 1-based order in which hints are revealed. */
  level: number
  text: string
}

// ---------------------------------------------------------------------------
// Tasks and missions. A course-lesson is composed of missions; a mission is
// composed of tasks. Each task is graded by one or more validators.
// ---------------------------------------------------------------------------

export interface TerminalTask {
  id: string
  title: string
  /** What the student is asked to accomplish (not which command to type). */
  description: string
  /** Skills exercised, e.g. ['pwd', 'cd']. */
  skills?: string[]
  /** All validators must pass for the task to be complete. */
  validators: Validator[]
  hints?: Hint[]
}

/**
 * A single mission: narrative + starting environment + tasks. The `systems`
 * list drives the spacecraft status panel (Section 32) — each system flips from
 * its pending label to its ready label when the linked task completes.
 */
export interface TerminalMission {
  id: string
  order: number
  title: string
  subtitle?: string
  /** In-world briefing that gives the student a reason to learn (Section 21). */
  narrative: string
  objectives?: string[]
  skills?: string[]
  tasks: TerminalTask[]
  init: EmulatorInit
  systems?: Array<{
    id: string
    label: string
    pendingLabel: string
    readyLabel: string
    /** Task id whose completion flips this system to ready. */
    taskId: string
  }>
  /** Line shown when every task passes, e.g. "FLIGHT CREW: AUTHORIZED". */
  completionBanner?: string
  /**
   * Optional in-world launch-readiness diagnostic (the `verify-launch.sh`
   * capstone tool). Purely feedback: it reports GO/NO-GO by re-running these
   * validators against live state. The mission's task validators remain the
   * sole grader — this can never disagree with them because it shares them.
   */
  readiness?: LaunchReadinessSpec
}

// ---------------------------------------------------------------------------
// Launch readiness report — powers the in-world `verify-launch.sh` diagnostic.
// Each subsystem is GO only when all of its validators pass; the report reads
// the SAME live EmulatorState the mission is graded on.
// ---------------------------------------------------------------------------

export interface LaunchReadinessSubsystem {
  /** Display label, e.g. "Flight Crew". */
  label: string
  /** All validators must pass for this subsystem to report GO. */
  validators: Validator[]
}

export interface LaunchReadinessSpec {
  /** Heading line for the report. */
  title?: string
  /** Executable name the student runs, e.g. "verify-launch.sh". */
  scriptName?: string
  subsystems: LaunchReadinessSubsystem[]
  /** Footer shown when every subsystem is GO. */
  goLine?: string
  /** Footer shown when any subsystem is NO-GO. */
  holdLine?: string
}
