# Active Phase Task Tracker

Phase: PHASE_03_ANALYTICS
Updated: 2026-08-29

## Status legend

- TODO
- IN_PROGRESS
- BLOCKED
- DONE

## Task table

| Task ID | Task summary | PRD refs | Owner | Type (UI/BE/DB/SEC/QA) | Status | Evidence links | Skill evidence (UI only) | Blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P3-T01 | Implement event taxonomy and validated event ingestion endpoint | 45, 98, 152, 228, 244, 245 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T02 | Enforce event quality policy (no map-noise, operational-only events) | 46, 99, 152, 244 | Copilot | SEC | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T03 | Implement KPI definitions and summary computation services | 47, 48, 153, 154, 175, 176 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T04 | Implement analytics time filters (today/7d/30d/90d/custom) | 154, 177, 217 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T05 | Implement geographic analytics by wilaya and verification status | 155, 218, 246, 247 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T06 | Implement pre-aggregated metric strategy and aggregate refresh path | 228, 248, 249 | Copilot | DB | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T07 | Implement organiser activity/effectiveness metrics | 175, 176, 250 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T08 | Implement operational alerts for unresolved/high-priority states | 152, 153, 229, 254 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T09 | Keep analytics ingestion async/non-blocking for urgent actions | 152, 228 | Copilot | BE | DONE | .github/verification/phase-03-verification.md | N/A |  |
| P3-T10 | Implement admin analytics dashboard with KPI hierarchy and filters | 130, 131, 132, 133, 134, 135, 136 | Copilot | UI | DONE | .github/verification/phase-03-verification.md | ui-ux-pro-max + gpt-taste |  |
| P3-T11 | Implement organiser analytics dashboard with actionable trends | 130, 131, 132, 133, 134, 135, 136 | Copilot | UI | DONE | .github/verification/phase-03-verification.md | ui-ux-pro-max + gpt-taste |  |
| P3-T12 | Add unit/integration tests for ingestion, KPIs, and filters | 111, 112, 113, 114, 115 | Copilot | QA | DONE | .github/verification/phase-03-verification.md | N/A |  |

## Rules

- All active-phase scope items must be represented as tasks.
- No task may be omitted because it is small.
- Any BLOCKED task must include blocker notes and a resolution path.
- Phase cannot transition if non-approved open tasks remain.
