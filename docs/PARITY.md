# Web ↔ Mobile Parity

| Web Route/Page | Mobile Screen | Status |
| --- | --- | --- |
| `/` Landing / Home | Home | Partial |
| `/command` Command Center | Command Center | Partial |
| `/launches` (via Command Center) | Launches | Partial |
| `/sky-events` | Sky Events | Partial |
| `/comets` | Comets | Partial |
| `/solar-map` | Solar Map | Placeholder |
| `/updates/live` | Streams | Placeholder |
| `/missions/briefing` | Mission Briefing | Partial |

Status Legend:
- **Full**: Feature parity
- **Partial**: Core data present, simplified UI
- **Placeholder**: Screen exists but minimal content

## Data Access Rule
Both web and mobile use `packages/core/src/services/*` for launches, sky events, alerts, comets, and solar activity.
