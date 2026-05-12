# Learning Foundation (Sprint 1)

This document defines the Learning Foundation domain for StarKid Command. It introduces the shared lesson schema, block types, submissions, review states, and progress structures used by both web and mobile apps.

## What Is a Lesson?

A lesson is a structured, versioned learning object made up of ordered blocks. Lessons are not a flat list of steps. They include metadata (track, difficulty, module type, status, tags) and an ordered list of blocks (instructions, concepts, questions, etc.).

Lessons are served only through the learning services in `packages/core`.

## Where Learning Lives

```
packages/core/src/learning/
  models/
  services/
  repositories/
  seeds/
  utils/
  index.ts
```

Learning is isolated from missions/alerts. Apps must consume lesson data only via learning services.

## Lesson Schema

Key fields:

- `id`, `slug`, `title`, `subtitle`, `summary`
- `track` (math, science, cyber, linux, ai, general)
- `moduleType` (stem, cyberlab, future)
- `difficulty` (cadet, explorer, specialist, operator)
- `estimatedMinutes`
- `skills`, `tags`, `sourceEvent`, `objective`
- `status` (draft, in_review, approved, published, archived)
- `version`
- `blocks[]`
- `rewards` placeholder
- `createdAt`, `updatedAt`

## Block Types

Supported block types:

- `mission_brief`
- `concept`
- `instruction`
- `worked_example`
- `question_numeric`
- `question_short_text`
- `question_multiple_choice`
- `hint`
- `checkpoint`
- `submission_prompt`
- `completion`

Blocks are discriminated unions in `models/blocks.ts`. Each block type has specific required fields.

## Submission Model

Submissions are future-safe for auto-graded and human-reviewed workflows.

Fields:

- `submissionId`
- `lessonId`
- `userId` (nullable)
- `attemptId`
- `answers`
- `status` (draft, submitted, under_review, approved, needs_changes, rejected)
- `submittedAt`
- `reviewNotes`
- `score`
- `metadata`

## Progress Model

Progress is stored separately from submissions and is user-safe for future account linkage.

Fields:

- `lessonId`
- `userId` (nullable)
- `state` (not_started, in_progress, submitted, completed)
- `startedAt`, `lastActivityAt`, `completedAt`
- `attemptCount`
- `completionPercent`
- `rewardId` (optional placeholder)

## Service Access (Required)

Apps must use learning services. Do not access lesson data directly.

Available services:

- `listLessons()`
- `listLessonsByModuleType(moduleType)`
- `getLessonById(id)`
- `getLessonBySlug(slug)`
- `createSubmission(submission)`
- `saveDraftSubmission(submission)`
- `getSubmissionByAttemptId(attemptId)`

## Seed Lesson

A full reference lesson is included:

**Launch Fuel Ratio Calculation**

This lesson demonstrates:

- mission brief
- concept block
- instructions
- worked example
- numeric question
- short-text response
- hint
- submission prompt
- completion

Use this lesson as the template for future authoring.

## Authoring Guidance

When creating new lessons:

- Use structured blocks (do not embed all content in a single block).
- Provide a clear `objective` and `summary`.
- Include at least one question block.
- Keep `status` accurate (draft → published).
- Increment `version` when changing lesson content.

## What Not To Do

- Do not hardcode lessons in app UI.
- Do not bypass learning services.
- Do not couple lesson rendering to mission alerts.
- Do not add approval UI in Sprint 1.

## Minimal Integration

Apps may include dev-only routes/screens to validate lesson loading. Production UI should not rely on direct lesson rendering in Sprint 1.
