# Terminal UI (Chunk 2) — architecture & assumptions

The web terminal for Linux Mission Training is a **custom, lightweight React
terminal**, not xterm.js. This was a deliberate change from the original handoff
note: the Chunk 1 engine is a **line-based emulator** (`command -> CommandResult`),
not a raw PTY byte stream, so a custom renderer fits the model directly and adds
no dependency. xterm.js remains the right choice only once StarKid moves to a
real PTY/container backend (see "Future phase").

## Layers

```
Phase 1 (now)
  TerminalMissionBlock.jsx     mission panel + grading + progress write-back
      |  (backend contract only)
  Terminal.jsx                 presentational terminal: scrollback, input, history
      |
  terminalBackend.js           createEmulatorBackend(mission) : TerminalBackend
      |
  @starkid/core terminal       createEmulator / runCommand (pure, immutable)
      |
  evaluateMission(state, ...)   deterministic, state-based validators

Future phase
  Terminal.jsx (unchanged)
      |
  createPtyBackend(...)         same TerminalBackend contract
      |
  xterm.js -> WebSocket -> PTY -> isolated Linux container
```

## The backend contract

`terminal/terminalBackend.js` defines `TerminalBackend`:

- `getPrompt(): string` — the shell prompt (`user@host:cwd$`).
- `run(input): { output, clear?, exitCode }` — execute one command line.
- `getSnapshot(): any` — opaque state the mission validators grade against.
- `reset(): void` — restore the mission's initial state.

`Terminal.jsx` and the mission UI depend **only** on this contract — neither
imports the emulator. A PTY-backed implementation is a drop-in replacement.

## Grading

Grading is **state-based**, never command-based. After each command (and on
Validate), `TerminalMissionBlock` calls `evaluateMission(getSnapshot(), mission)`
and writes the answer for the block as:

```js
{ emulatorState, passed, completedTaskIds }
```

Core `playerValidation.ts` re-runs `evaluateMission` against `emulatorState`
before the lesson can be submitted, so completion is deterministic and cannot be
faked with a stale `passed` flag.

## Honesty rule (what is intentionally NOT faked)

The UI exposes only what the emulator supports: discrete command execution with
combined stdout/stderr and an exit code. There is **no** cursor addressing and
**no** interactive programs (`top`, `less`, `vi`) or raw PTY behavior. Supported
UX: visible prompt, command input, Enter to run, Up/Down history, Ctrl+L / `clear`
to clear, scrollback, monospace output, success/error coloring, auto-focus,
`role="log"`/`role="status"` for accessibility, and a responsive stack→split
layout.

## Assumptions a future PTY backend must preserve

1. `getSnapshot()` must return whatever object the mission validators expect. Today
   that is an `EmulatorState`; a PTY backend must supply an equivalent probe
   (e.g. the output of a state-capture script mapped to the same shape) so the
   existing validators keep working unchanged.
2. `reset()` returns to `mission.init` (a fresh machine), not to any resumed state.
3. `run()` is synchronous today. A PTY backend will be async; when that lands,
   `Terminal.jsx`'s `runCommand` handler is the single place to await — the
   contract and the mission UI stay the same otherwise.
