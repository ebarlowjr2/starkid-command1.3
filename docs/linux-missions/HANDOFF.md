# Linux Mission Training — build handoff

> Purpose: let a fresh Claude Code session (scoped to `star-kid-command`) resume
> this work without the original chat context. Read this first.

## What this is
Implementing **Linux Mission Training** inside the existing StarKid Command
Learning/STEM area. Students learn Linux by preparing a spacecraft for launch in
a real in-browser terminal; missions are graded on resulting system state, not
typed commands.

**Course 1:** Linux Level I — Prepare for Launch (7 missions built; capstone +
launch sequence still to come). Levels II/III are architected for but not built.

## Branch & rules
- Work on branch **`feature/linux-learning-missions`**. Do NOT merge to main.
- Keep commits small/isolated; use explicit `git add <paths>` (never `git add -A`).

## Key architecture decisions
- **Web-first, browser-emulated Linux** (no server sandbox for MVP). Pure,
  deterministic emulator in the browser; a real container sandbox can later
  satisfy the same `CommandResult` contract.
- **Reuse the existing learning pipeline.** Terminal missions plug in as a new
  lesson block type (`terminal_mission`):
  - Persistence/progress/XP: `learning_progress` table + `modules/progressService.ts`.
  - Player: `packages/core/src/learning/player/*`; block model in `models/blocks.ts`;
    validation switch in `player/playerValidation.ts`.
  - Web player: `apps/web/src/features/learning/screens/LessonPlayerScreen.jsx`
    + `components/BlockRenderer.jsx` (switch on `block.type`).
  - Catalog: `learning_modules` row linked by `lesson_slug`, must be
    `status='published'`; lessons authored as data (seeds).
- **Course-as-lesson for MVP:** Level I = one course-lesson whose blocks are an
  intro brief + the 7 missions (each a `terminal_mission` block) + a final submit.
- **Forgiving permissions (Level I):** modes/owners/groups are tracked (so
  chmod/chown validators work) but execution does NOT hard-block on read/write
  perms, to avoid lockouts.
- **Mobile compat:** all mission/validator/progress definitions live in
  `packages/core`; only the terminal UI is web-only. Don't break `apps/mobile`.

## Chunk plan & status
- [x] **Chunk 1 — core engine.**
  - `packages/core/src/learning/terminal/{types,emulator,validators,index}.ts`.
  - Emulator commands: pwd ls cd whoami hostname clear echo mkdir touch cp mv rm
    cat chmod chown chgrp id groups useradd groupadd usermod ps df free uptime
    uname grep help; `>`/`>>` redirection; one `| grep`. Pure & immutable.
  - Validators (state-based): directory_exists, file_exists, file_contains,
    exact_content, owner_matches, group_matches, permissions_match, user_exists,
    group_exists, user_in_group, process_running, cwd_is, command_output_matches,
    script_exit_code. Plus `evaluateTask`/`evaluateMission`.
- [x] **Chunk 2 — web terminal UI.** Custom lightweight React terminal (NOT
  xterm.js — the engine is line-based, not a PTY) behind a swappable
  `TerminalBackend` contract. See `docs/linux-missions/terminal-ui.md`.
  - Core: `terminal_mission` added to `models/blocks.ts`; `playerValidation.ts`
    re-grades the saved emulator snapshot with `evaluateMission` and gates submit.
  - Web: `terminal/terminalBackend.js`, `components/Terminal.jsx`,
    `components/blocks/TerminalMissionBlock.jsx`, `case` in `BlockRenderer.jsx`.
  - Answer under `answers[block.id]`: `{ emulatorState, passed, completedTaskIds }`.
- [x] **Chunk 3 — Level I content.** Missions 1–7 as one seed
  (`seeds/linuxLevel1Course.ts`, slug `linux-level-1-prepare-for-launch`),
  registered in `mockLearningRepository.ts`, exported from `learning/index.ts`.
  Route: `/learning/lesson/:slug`. One continuous "prepare the spacecraft Aurora"
  story: report/orient → build workspace → checklist → crew (users/groups) →
  secure keys (perms) → flight-computer health report (redirect capture) →
  verify processes (ps | grep > log). Each mission's `init` is self-contained.
  Verified 39/39 via esbuild smoke test (fresh state fails, solvable with real
  commands, all systems flip READY, submit gated until all pass).
- [ ] **Chunk 4 — capstone + launch sequence** (Mission 8: countdown/ignition/
  badge). NOTE emulator limits: no live process control, so the launch sequence
  must be a presentation/UI block gated on file/state deliverables, not driven by
  emulator process state.
- [ ] **Chunk 5 — DB seed** (`learning_modules` row for Level I, published) +
  route/nav wiring (Linux course landing + mission select).
- [ ] **Chunk 6 — tests + docs** (cross-user isolation, unauthorized access;
  architecture/adding-a-mission/adding-a-validator/reset docs).

## Running tests
`pnpm -C packages/core test` (vitest). If vitest stalls, bundle a smoke script
that imports from `packages/core/src/learning/terminal/index.ts` with esbuild
(`node_modules/.bin/esbuild <file> --bundle --platform=node --format=esm
--outfile=out.mjs`) then `node out.mjs`.

## Environment note
The original checkout lived under `~/Desktop` (iCloud "Desktop & Documents"),
which evicted the repo to dataless placeholders and made git/Vite unusable. This
branch was reconstructed onto a fresh clone under `~/Developer` (non-iCloud).
Keep working copies out of iCloud-synced folders.
