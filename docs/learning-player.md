# Learning Player (Sprint 2)

This document explains the guided lesson player built on top of the Learning Foundation.

## Overview

The lesson player renders structured lessons block-by-block using shared logic from `packages/core`. Web and mobile use the same lesson schema, progression rules, validation, and submission payload shape.

## Shared Player Logic

Location:

```
packages/core/src/learning/player/
  playerState.ts
  playerValidation.ts
  playerController.ts
  index.ts
```

### What is shared

- progression rules
- active block tracking
- answer storage by block id
- validation for required blocks
- submission payload assembly

### Validation rules

- numeric questions require numeric input
- short text questions require non-empty input
- multiple choice requires selection
- checkpoints require acknowledgement

Final submit is blocked if required answers are missing.

## Web Usage

Location:

```
apps/web/src/features/learning/screens/LessonPlayerScreen.jsx
```

Route:

`/learning/lesson/:slug`

Blocks are rendered one at a time. The player uses `getLessonBySlug` from the learning service and the shared player controller from core.

## Mobile Usage

Location:

```
apps/mobile/src/features/learning/screens/LessonPlayerScreen.tsx
```

Navigation:

`LessonPlayer` screen (slug param) wired from the Learning Hub.

## Adding a new block type

1. Add the block type to `models/blocks.ts`.
2. Add validation rules (if needed) in `playerValidation.ts`.
3. Render the block in:
   - web `BlockRenderer`
   - mobile `BlockRenderer`

Keep block semantics consistent across platforms.

## Submission Flow

The final action is **Submit to Command**. The player builds a submission payload using shared logic and routes it through the learning service (`createSubmission`).

Submissions are currently stored in the mock learning repository and are future-safe for account linkage.
