# Linux Mission Training — architecture

How the pieces fit together. Read [HANDOFF.md](./HANDOFF.md) first for the why;
this is the how.

## Layers

```
packages/core (platform-neutral, no DOM)          apps/web (React UI only)
┌───────────────────────────────────────────┐    ┌────────────────────────────┐
│ terminal/types.ts     domain types         │    │ terminal/terminalBackend.js│
│ terminal/emulator.ts  createEmulator/      │◄───┤   wraps runCommand,         │
│                       runCommand (pure)    │    │   getSnapshot()             │
│ terminal/validators.ts state-based grading │◄───┤ components/Terminal.jsx     │
│ terminal/readiness.ts  verify-launch report│    │ components/blocks/          │
│ seeds/linuxLevel1Course.ts  the content    │    │   TerminalMissionBlock.jsx  │
│ models/blocks.ts      lesson block union   │    │   LaunchSequenceBlock.jsx   │
│ player/*              lesson progression   │◄───┤ components/BlockRenderer.jsx │
│                       + validateLesson...  │    │ screens/LessonPlayerScreen  │
└───────────────────────────────────────────┘    └────────────────────────────┘
```

**Rule:** everything a mission needs to be defined and graded lives in
`packages/core`, so `apps/mobile` can consume the same missions later. Only the
interactive terminal *rendering* is web-only. Never move mission/validator logic
into `apps/web`.

## The emulator (core/terminal/emulator.ts)

A pure, deterministic, in-browser Linux model. `createEmulator(init)` builds an
`EmulatorState` (filesystem tree, users, groups, processes, cwd). `runCommand`
takes `(state, line)` and returns a **new** `CommandResult` — it clones and never
mutates its input, which is what makes reset trivial and sessions isolated.

Supported: `pwd ls cd whoami hostname clear echo mkdir touch cp mv rm cat chmod
chown chgrp id groups useradd groupadd usermod ps df free uptime uname grep`,
with `>`/`>>` redirection and a single `| grep`. There is no PTY, no interactive
program (vi/less/top), and no live process control — author within this set.

## Grading — state, never keystrokes

The core principle: **grade the resulting system state, not the commands typed.**
`validators.ts` inspects the `EmulatorState`; any sequence of valid commands that
produces the required state passes. `evaluateMission(state, mission)` runs every
task's validators and returns which tasks passed.

## Data flow (one mission)

1. `TerminalMissionBlock` creates a backend: `createEmulatorBackend(mission, saved?)`.
2. Each command → `backend.run()` → `runCommand` → new state kept in the backend.
3. After every command the block calls `evaluateMission(backend.getSnapshot(), mission)`
   and writes the answer as `{ emulatorState, passed, completedTaskIds }` under the
   block id.
4. On submit, `player/playerValidation.ts` **re-grades** that saved snapshot with
   `evaluateMission` — a stored `passed` flag is never trusted.

## The capstone (Chunk 4)

- **Mission 8** is an ordinary `terminal_mission`: a fresh deterministic Aurora
  seeded with deliberate faults. No special grading path.
- **`verify-launch.sh`** is a *feedback* diagnostic. `terminal/readiness.ts`
  builds a GO/NO-GO report by re-running the mission's `readiness` validators
  against live state; the web backend intercepts the script name and prints it.
  It never grades — `evaluateMission` remains the sole grader, so the report can
  never disagree with the actual verdict.
- **`launch_sequence`** is a presentational block (`LaunchSequenceBlock.jsx`)
  gated on the capstone mission grading complete (`requiresBlockId`). It plays the
  countdown/ignition payoff and surfaces the badge; it is not required for submit.

## See also

- [adding-a-mission.md](./adding-a-mission.md)
- [adding-a-validator.md](./adding-a-validator.md)
- [reset.md](./reset.md)
- [terminal-ui.md](./terminal-ui.md)
