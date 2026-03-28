# Learning Module Template Standard

## Purpose
This document defines the **official Learning Module Template Standard** for StarKid Command. The current **web admin UI** (`/learning/admin`) is the canonical authoring surface, and this standard is derived directly from its fields and the Supabase-backed module system in use today.

All future modules (STEM, Cyber Lab, AI, Linux, and beyond) must follow this template. Web and mobile share the same module structure; only presentation may vary by platform.

---

## Learning Flow Context
Modules must support the current product flow:

**STEM Activities → Access Module → Mission Detail → Start Mission → Guided Lesson Player**

A module must provide:
- discovery metadata for the **list card**
- mission-entry content for the **detail screen**
- a step structure that the **lesson player** can execute

---

## Module Definition
A Learning Module is a structured training unit that includes:
- **Discovery metadata** (list card)
- **Mission entry content** (detail screen)
- **Guided step structure** (player sequence)
- **Answer/validation metadata** (where applicable)

---

## Canonical Field List (from Admin UI)
The following fields are supported by the current admin form and Supabase table.

| UI Label | Canonical Field | Required | Format | Example |
|---|---|---|---|---|
| Title | `title` | Yes | string | `Launch Fuel Ratio Calculation` |
| Description | `description` | Yes | string | `Compute the correct fuel mix ratio required for a rocket stage.` |
| Tagline | `tagline` | Yes | string | `Mission math for stable liftoff performance` |
| Training Type | `training_type` | Yes | string | `Math` |
| Module Type | `module_type` | Yes | enum/string | `stem` |
| Track | `track` | Yes | enum/string | `math` |
| Level | `level` | Yes | enum/string | `cadet` |
| Estimated Minutes | `estimated_minutes` | Yes | integer | `5` |
| Block Count | `block_count` | Yes | integer | `7` |
| Block List | `block_list` | Yes | array of strings | `['mission_brief', 'concept', ...]` |
| Mission Context | `mission_context` | Yes | string | `Mission Control requires verification...` |
| Objective | `objective` | Yes | string | `Determine the correct oxidizer-to-fuel ratio...` |
| Mission Outcomes | `mission_outcomes` | Yes | array of strings | `['Review the mission brief', ...]` |
| Tags | `tags` | Optional | array of strings | `['launch','math']` |
| Lesson Slug | `lesson_slug` | Required for playable module | string | `launch-fuel-ratio-calculation` |
| Answer Key | `answer_key` | Optional | string | `1560 kg` |

**Note on naming:**
- Admin UI uses user-facing labels (e.g., “Training Type”), while Supabase uses snake_case (e.g., `training_type`).
- The canonical field names above match the **database schema**.

---

## Required vs Optional Fields

### Required for a publishable module
- `title`
- `description`
- `tagline`
- `training_type`
- `module_type`
- `track`
- `level`
- `estimated_minutes`
- `mission_context`
- `objective`
- `mission_outcomes`
- `block_list`
- `block_count`
- `lesson_slug` (required if the module should launch the lesson player)

### Optional / enhancement fields
- `tags`
- `answer_key`

---

## Allowed Values / Controlled Vocabulary
These are the **current intended values** (not strictly enforced yet).

### Training Type (author-facing)
- `Math`
- `Cyber`
- `Linux`
- `AI`

### Module Type (system-facing)
- `stem`
- `cyberlab`
- `ai`
- `linux`

### Track (internal)
- `math`
- `science`
- `cyber`
- `linux`
- `ai`

### Level (internal)
- `cadet`
- `explorer`
- `specialist`
- `operator`

---

## Block / Step Standard (Current Live Pattern)
The lesson player uses a guided sequence, one step at a time. The current live pattern for the reference module (Launch Fuel Ratio) is:

1. `mission_brief`
2. `concept`
3. `instruction` + **worked example combined in same step**
4. `question_numeric` (with embedded hint toggle)
5. `question_short_text`
6. `checkpoint`
7. `submission_prompt` (includes completion message)

Notes:
- Hints are **embedded inside a question step**, not always separate blocks.
- Some conceptual blocks may be combined into a single step.
- The step list in the module entry screen is a simplified preview of the sequence.

---

## Module Authoring Guidance
- **Title**: mission-oriented and specific
- **Tagline**: concise and outcome‑focused
- **Mission Context**: explain why the task matters
- **Objective**: clear, measurable learner goal
- **Outcomes**: preview the learner experience
- **Steps**: short, focused, guided — avoid long text blocks
- **Lesson player experience** should feel like a mission, not a worksheet

---

## UI Mapping

### STEM Activities list card uses:
- `title`
- `track` + `level`
- `description`
- CTA: Access Module

### Mission Detail screen uses:
- `title`
- `tagline`
- metadata row (`training_type`, `level`, `block_count`, `estimated_minutes`)
- `mission_context`
- `objective`
- `mission_outcomes`
- `block_list`
- CTA: Start Mission (if `lesson_slug` exists)

### Lesson Player uses:
- the lesson referenced by `lesson_slug`
- step/block sequence
- answer validation (numeric + text + checkpoint)
- submit flow

---

## Answer Key / Validation Notes
- `answer_key` is optional and currently stored as plain text.
- The lesson player enforces validation for numeric, text, and checkpoint steps.
- Full grading logic is **not yet standardized**.

---

## Slug Standard
Lesson slugs must be:
- lowercase
- hyphen-separated
- unique
- stable after publishing

Example:
`launch-fuel-ratio-calculation`

---

## Tags Standard
- **Training type** = high‑level category (Math, Cyber, Linux, AI)
- **Module type** = system grouping (stem, cyberlab, etc.)
- **Tags** = freeform metadata for search/filtering

---

## Publishable Module Checklist
A module is ready when it has:
- clear title + tagline
- training type + module type
- track + level
- estimated minutes
- mission context
- objective
- learner outcomes
- block list + count
- lesson slug (if playable)
- tags (optional)
- answer key (if needed)

---

## Reference Example
**Launch Fuel Ratio Calculation** is the current reference module. All new modules should match its structure and quality.

---

## Future Notes (Planned)
These are planned but not required yet:
- approval workflow / reviewer routing
- multi‑approver support
- stronger grading logic
- richer block types
- admin permission gating

