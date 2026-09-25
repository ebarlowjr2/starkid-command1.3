# Adding a mission

A mission is a `TerminalMission` object (see `packages/core/src/learning/terminal/types.ts`).
Missions are authored as data in a seed and surfaced as `terminal_mission` blocks
inside a course-lesson. This walks through adding one to Linux Level I
(`packages/core/src/learning/seeds/linuxLevel1Course.ts`); a brand-new course
follows the same shape.

## 1. Define the mission

```ts
const missionN: TerminalMission = {
  id: 'linux-l1-mN-slug',
  order: N,
  title: 'Mission N — Title',
  subtitle: 'One-line what-and-why',
  narrative: 'In-world reason to learn. State the goal, not the commands.',
  objectives: ['Operator-level goal 1', 'Operator-level goal 2'],
  skills: ['ls', 'chmod'],            // for display only
  init: {                              // the starting machine (see EmulatorInit)
    user: 'cadet', hostname: 'aurora-fc', home: '/home/cadet', cwd: AURORA,
    groups: [/* GroupAccount[] */],
    users: [/* UserAccount[] */],
    processes: [/* ProcessInfo[] */],
    files: [{ path: `${AURORA}/thing`, type: 'file', owner: 'cadet', group: 'cadet', mode: 0o644, content: '...' }],
  },
  tasks: [
    {
      id: 'mN-task',
      title: 'Objective title',
      description: 'What to accomplish — not which command to run.',
      skills: ['chmod'],
      validators: [ /* one or more; ALL must pass — see adding-a-validator.md */ ],
      hints: [
        { level: 1, text: 'Conceptual nudge.' },
        { level: 2, text: 'The technique / which tool.' },
        { level: 3, text: 'The exact command.' },
      ],
    },
  ],
  systems: [   // spacecraft status panel; each flips when its task passes
    { id: 'sys', label: 'SUBSYSTEM', pendingLabel: 'PENDING', readyLabel: 'READY', taskId: 'mN-task' },
  ],
  completionBanner: 'SUBSYSTEM: READY',
}
```

## 2. Register it

Add it to the `missions` array in the seed:

```ts
const missions = [mission1, /* … */, missionN]
```

The course automatically renders `mission_brief` → each mission as a
`terminal_mission` block → the finale. Update the brief's `stats` count and the
`summary`/`objective` copy if the mission count changed.

## Authoring rules (enforced by convention, verified by tests)

- **Grade state, never keystrokes.** Only use validators; never check the command
  string. Any correct approach must pass.
- **Only use the supported command set** (see [architecture.md](./architecture.md)).
  No interactive editors, no live process control. If a fix isn't expressible with
  those commands, don't make it a required task.
- **Make `init` self-contained.** Pre-seed anything a mission "inherits"; never
  assume state carries over from an earlier mission.
- **Reveal the command only through progressive hints** (nudge → technique → exact).
- **Make faults fixable.** For a troubleshooting mission, every deliberate fault
  must be correctable with the command set (e.g. `usermod`, `chmod`, `mv`, `echo >`).

## 3. Test it

Add coverage in `packages/core/src/learning/terminal/__tests__/`:

```ts
// fresh state must fail
expect(evaluateMission(createEmulator(missionN.init), missionN).passed).toBe(false)
// a real solution must pass
const solved = [/* commands */].reduce((s, c) => runCommand(s, c).state, createEmulator(missionN.init))
expect(evaluateMission(solved, missionN).passed).toBe(true)
```

Run: `pnpm -C packages/core test`. If vitest stalls, use the esbuild smoke
approach from [HANDOFF.md](./HANDOFF.md).
