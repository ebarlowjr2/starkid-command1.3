# Architecture Notes

## Services-First Rule
Apps (web + mobile) **must call services only** for:

- launches
- sky events
- alerts
- comets
- solar activity

Services live in `packages/core/src/services/` and are the only supported access point for these features.

### Why
- Aggregates multiple sources
- Normalizes into `@starkid/types`
- Dedupe + stable sort
- Returns diagnostics for partial failures

## Service Result Contract

Each service returns:

```
{ data, sources, warnings? }
```

Where `sources` is an array of source status entries:

```
{ name, ok, count?, error? }
```

Use `formatSourceStatus(sources)` for logging or debug UI.

## Allowed Exceptions
Pure UI helpers (formatters, render helpers) can live in app code.
Apps should not import domain or client functions for the features listed above.

## Offline Cache Layer
Services use the shared cache helpers in `packages/core/src/storage/cache.js`:

- cached data is returned when sources fail
- cache uses TTL and may serve stale data when offline

Apps should not implement their own fetch caches for these features.

## STEM Module
STEM powers both structured Activities and dynamic Missions.

- Activities and Missions share templates + grading.
- Dynamic missions are generated via `packages/core/src/stem/service.ts`.
- Apps must not bypass STEM services for mission generation.

## STEM Progress Rule
All STEM progress (activity completion + mission sync) must flow through:

`packages/core/src/stem/progress/service.ts`

Apps must not compute progress directly or store progress in component state.

## Mission vs STEM Activities (UI Separation)
Command Center Missions and STEM Activities are separate user experiences.

- **Command Center** shows live alerts and mission opportunities.
- **STEM Activities** is a structured learning catalog with progress tracking.

Both are powered by the STEM engine internally, but the UI must keep them distinct.
