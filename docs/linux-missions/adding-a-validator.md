# Adding a validator

Validators are how missions grade **resulting system state**. Each one inspects an
`EmulatorState` and returns `{ passed, message }`. They live in
`packages/core/src/learning/terminal/validators.ts` and are typed in `types.ts`.

## Existing validators

`directory_exists`, `file_exists`, `file_contains`, `exact_content`,
`owner_matches`, `group_matches`, `permissions_match`, `user_exists`,
`group_exists`, `user_in_group`, `process_running`, `cwd_is`,
`command_output_matches`, `script_exit_code`.

Most missions only need these — prefer composing them (a task takes an array;
**all** must pass) before adding a new type.

## Add a new type

1. **Declare it** in `types.ts`:
   - add the string to the `ValidatorType` union;
   - if it needs new inputs, add optional fields to the `Validator` interface
     (keep them optional — every validator shares one interface).

   ```ts
   export type ValidatorType =
     | 'file_exists'
     // …
     | 'file_larger_than'      // new

   export interface Validator {
     // …
     minBytes?: number         // new input
   }
   ```

2. **Implement it** in `validators.ts` — add a `case` to the `runValidator`
   switch. Use the `resolve(state, path)` helper for filesystem lookups and the
   `pass(v, msg)` / `fail(v, msg)` helpers so authors' `successMessage` /
   `failureMessage` overrides are honored:

   ```ts
   case 'file_larger_than': {
     const r = resolve(state, v.path)
     if (r?.node?.type !== 'file') return fail(v, `File ${v.path} does not exist yet.`)
     const size = (r.node.content ?? '').length
     return size >= (v.minBytes ?? 0)
       ? pass(v, `${v.path} is large enough.`)
       : fail(v, `${v.path} must be at least ${v.minBytes} bytes.`)
   }
   ```

   Keep it a **pure** read of state — no mutation, no DOM, no time/randomness.
   `runValidators` / `evaluateTask` / `evaluateMission` pick it up automatically.

3. **Give a student-friendly `failureMessage`.** It shows in the objectives panel
   and drives the "what's left to do" experience, so make it actionable without
   giving away the exact command.

4. **Test it** in `packages/core/src/learning/terminal/__tests__/`: assert it
   fails on a fresh state and passes after the intended fix.

## Note on `command_output_matches`

State-only validators can't see stdout. `command_output_matches` is a placeholder
for output-based checks the UI would capture; prefer state validators. The
capstone's `verify-launch.sh` report (see `readiness.ts`) is built from ordinary
state validators for the same reason — it stays consistent with grading.
