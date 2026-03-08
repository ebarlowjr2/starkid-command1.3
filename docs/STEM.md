# STEM Module

## Overview
The STEM module powers both:

- **Structured Activities** (Explore → STEM Activities)
- **Dynamic Missions** generated from alerts and events

This ensures shared templates, grading, and progression.

## Tracks
- math
- cyber
- linux
- ai
- science

## Levels
- cadet
- explorer
- specialist
- operator

Levels map to complexity (not age) via `levels/levels.ts`.

## Templates
Templates live in `packages/core/src/stem/templates/` and define:

- title / briefing templates
- step builder
- grading mode
- expected answer logic

## Dynamic Mission Generation
Dynamic missions are generated through:

```
generateMissionFromAlert(alert)
generateMissionFromEvent(event, track, level)
```

Generators select the best template and return a `StemMission`.

## Grading
`gradeStemAttempt()` provides deterministic grading:

- numeric (with tolerance)
- text (case-insensitive)
- choice

## AI Augmentation
`ai/augment.ts` can enhance text only (title, briefing, hints).
It must never alter grading logic or answer keys.

## Progress Dashboard
STEM progress is computed via the progress service:

```
getStemProgressOverview()
```

The dashboard shows:
- track progress (completed/total + percent)
- current level per track
- recent completions
- recommended next activity

## Mission → Activity Sync
When a dynamic mission completes, the linked STEM activity is automatically marked complete:

```
syncMissionCompletionToActivity(mission)
```

This keeps structured activities and dynamic missions in sync across web + mobile.
