// Linux Mission Training — browser-emulated terminal, validators, and types.
// Web owns the interactive terminal UI; everything here is platform-neutral so
// mobile can consume the same mission/validator/progress definitions later.

export * from './types'
export {
  createEmulator,
  runCommand,
  normalizePath,
  modeToRwx,
  getNode,
} from './emulator'
export {
  runValidator,
  runValidators,
  evaluateTask,
  evaluateMission,
} from './validators'
export type { TaskEvaluation, MissionEvaluation } from './validators'
