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

