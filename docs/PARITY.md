# Web ↔ Mobile Parity

| Web Route/Page | Mobile Screen | Status |
| --- | --- | --- |
| `/` Landing / Home | Home | Partial |
| `/command` Command Center | Command Center | Partial (Mission Alerts, Mission Control, Space Weather, Asteroid Flybys, Upcoming Launches) |
| `/launches` (via Command Center) | Launches | Partial |
| `/sky-events` | Sky Events | Partial |
| `/comets` | Comets | Partial |
| `/solar-map` | Solar Map | Placeholder |
| `/updates/live` | Streams | Placeholder |
| `/missions/briefing` | Mission Briefing | Partial |
| `/stem-activities` | STEM Activities | Partial |
| `/stem-activities/:activityId` | STEM Activity Detail | Partial |
| `/stem/progress` | STEM Progress | Partial |
| `/profile` | Profile | Partial |
| `/updates` Updates Hub | Updates Hub | Partial |
| `/updates/news` | Updates News | Placeholder |
| `/updates/blog` | Updates Blog | Placeholder |
| `/updates/official` | Updates Official | Placeholder |
| `/updates/live` | Updates Live | Partial |
| `/updates/x` | Updates X | Placeholder |
| `/planets` Visit Another Planet | Planets Hub | Partial |
| `/planets/:id` (Mars) | Planet Detail | Partial |
| `/rockets` Rockets Hub | Rockets | Partial |
| `/rockets/launch-vehicles/:id` | Rocket Detail | Partial |
| `/rockets/spacecraft` | Spacecraft Hub | Partial |
| `/rockets/spacecraft/:id` | Spacecraft Detail | Partial |

Status Legend:
- **Full**: Feature parity
- **Partial**: Core data present, simplified UI
- **Placeholder**: Screen exists but minimal content

## Data Access Rule
Both web and mobile use `packages/core/src/services/*` for launches, sky events, alerts, comets, and solar activity.
