# Active Phase Task Tracker

Phase: PHASE_00_TECHNICAL_VALIDATION
Updated: 2026-08-29

## Status legend

- TODO
- IN_PROGRESS
- BLOCKED
- DONE

## Task table

| Task ID | Task summary | PRD refs | Owner | Type (UI/BE/DB/SEC/QA) | Status | Evidence links | Skill evidence (UI only) | Blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0-T01 | Validate PostGIS support in local dev DB `aman` (`CREATE EXTENSION postgis` feasibility) | 103, 251 | Copilot | DB | DONE | .github/phases/phase-00-evidence.md | N/A | Validation complete: PostGIS 3.6.2 installed and enabled |
| P0-T02 | Validate local database connectivity baseline | 102, 104, 251 | Copilot | DB | DONE | .github/phases/phase-00-evidence.md | N/A |  |
| P0-T03 | Document shared-host constraints and connection management implications | 102, 104 | Copilot | DB | DONE | .github/phases/phase-00-evidence.md | N/A | Baseline limits documented and production re-validation rule recorded |
| P0-T04 | Validate Prisma + PostGIS implementation approach (Prisma + parameterized raw SQL) | 28, 74, 163, 251 | Copilot | BE | DONE | .github/architecture/database-architecture.md | N/A |  |
| P0-T05 | Confirm map tile provider decision and operational constraints | 100, 251 | Copilot | BE | DONE | .github/phases/phase-00-evidence.md | N/A | MapTiler Cloud selected for MapLibre integration |
| P0-T06 | Confirm domain and HTTPS prerequisites for deployment | 251 | Copilot | SEC | DONE | .github/phases/phase-00-evidence.md | N/A | Domain confirmed as `aman-app.vercel.app` with Vercel-managed HTTPS |
| P0-T07 | Document no-backup operational risk and disaster-recovery limitation | 143, 144, 145 | Copilot | SEC | DONE | .github/engineering/observability-and-operations.md | N/A |  |

## Rules

- All active-phase scope items must be represented as tasks.
- No task may be omitted because it is small.
- Any BLOCKED task must include blocker notes and a resolution path.
- Phase cannot transition if non-approved open tasks remain.
