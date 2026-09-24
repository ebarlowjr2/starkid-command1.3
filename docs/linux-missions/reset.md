# Reset & state lifecycle

Because the emulator is pure and immutable, "reset" is just re-instantiating the
initial state — there is nothing to tear down.

## What reset does

`createEmulatorBackend(mission, savedSnapshot?)` in
`apps/web/src/features/learning/terminal/terminalBackend.js` holds the current
`EmulatorState`. Its `reset()` throws that away and rebuilds from the mission's
`init`:

```js
reset() { state = createEmulator(init) }   // init === mission.init, always
```

Note `reset()` returns to `mission.init` — **never** to a resumed snapshot. A
resumed session (progress rehydration) starts from `savedSnapshot`, but resetting
still takes the cadet back to the mission's true starting state.

In the UI (`components/blocks/TerminalMissionBlock.jsx`), the Reset button:

1. calls `backend.reset()`,
2. bumps a React `key` on `<Terminal>` so the scrollback component remounts clean,
3. clears revealed hints and the "Validate" detail view,
4. re-runs `evaluateMission` so the objectives/systems panel returns to pending.

## Why it's safe

- `runCommand` clones its input and returns a new state, so no command mutates
  `mission.init` or any earlier snapshot.
- Two sessions built from the same `init` are fully independent — one cadet's
  commands can't affect another's (covered by the cross-session isolation tests in
  `packages/core/src/learning/terminal/__tests__/terminal.test.ts`).

## Progress vs. terminal state

- **Terminal state** (the emulator snapshot) is saved per block as
  `{ emulatorState, passed, completedTaskIds }` under the block id.
- **Lesson progress** (current step, all answers) is persisted separately via
  `saveModuleProgress` for signed-in students; on return, the player rehydrates
  the snapshot so a mission resumes where it was left. Reset overrides that and
  returns to `mission.init`.
- Grading always **re-derives** pass/fail from the snapshot (`playerValidation.ts`),
  so a stale or tampered `passed` flag can never grant completion.
