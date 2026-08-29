# Active Phase Task Tracker

Phase: PHASE_01_CORE_PLATFORM
Updated: 2026-08-29 (gate-ready)

## Status legend

- TODO
- IN_PROGRESS
- BLOCKED
- DONE

## Task table

| Task ID | Task summary | PRD refs | Owner | Type (UI/BE/DB/SEC/QA) | Status | Evidence links | Skill evidence (UI only) | Blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1-T01 | Establish Next.js App Router modular monolith project structure | 70, 71, 72, 273, 276, 277 | Copilot | BE | DONE | .github/verification/phase-01-verification.md | N/A |  |
| P1-T02 | Configure strict TypeScript, linting, formatting, and dependency pinning | 7, 71, 116, 117, 118, 270 | Copilot | BE | DONE | .github/verification/phase-01-verification.md | N/A |  |
| P1-T03 | Implement locale architecture and no-hardcoded-string workflow | 19, 20, 21, 22, 151 | Copilot | BE | DONE | .github/verification/phase-01-verification.md | N/A | Locale middleware + dictionaries for ar-DZ/fr-DZ/tzm-DZ active |
| P1-T04 | Implement auth baseline (login/refresh/logout/block handling) | 5, 6, 7, 8, 9, 10, 11, 12, 14, 86, 88, 160 | Copilot | SEC | DONE | .github/verification/phase-01-verification.md | N/A | Login/refresh/logout routes + session rotation and revoke paths implemented |
| P1-T05 | Implement role and ownership middleware enforcement | 16, 43, 87, 161, 264, 265 | Copilot | SEC | DONE | .github/verification/phase-01-verification.md | N/A | Route-level role checks + organiser ownership checks enforced |
| P1-T06 | Implement core aid-point schema and constraints with multilingual and geo fields | 25, 27, 90, 91, 92, 93, 209, 190, 191 | Copilot | DB | DONE | .github/verification/phase-01-verification.md | N/A | Prisma schema + migration applied; PostGIS extension validated |
| P1-T07 | Implement nearby endpoint with radius allowlist, PostGIS query, result bounds | 29, 30, 31, 106, 107, 162, 261 | Copilot | BE | DONE | .github/verification/phase-01-verification.md | N/A | Nearby endpoint validated with allowlist and bounded query results |
| P1-T08 | Implement map-summary and detail endpoint separation | 33, 83, 107 | Copilot | BE | DONE | .github/verification/phase-01-verification.md | N/A | `/api/aid-points/nearby` and `/api/aid-points/[id]` contracts separated |
| P1-T09 | Implement public map-first UX with optional GPS and fallback search/actions | 17, 18, 34, 35, 37, 130, 134, 135, 136, 159, 180, 181, 206, 207 | Copilot | UI | DONE | .github/verification/phase-01-verification.md | ui-ux-pro-max + gpt-taste | Public map shell includes GPS, manual search, loading/error/empty/success states |
| P1-T10 | Implement organiser dashboard baseline and own-point management baseline | 40, 41, 42, 231, 232 | Copilot | UI | DONE | .github/verification/phase-01-verification.md | ui-ux-pro-max + gpt-taste | Organiser baseline dashboard and own-point update API implemented |
| P1-T11 | Implement super admin baseline dashboard and organiser management baseline | 44, 49, 50, 51, 172, 173, 174, 234, 235 | Copilot | UI | DONE | .github/verification/phase-01-verification.md | ui-ux-pro-max + gpt-taste | Admin baseline dashboard + organiser create/list/block APIs implemented |
| P1-T12 | Implement request IDs, API envelope standards, baseline rate limiting | 81, 82, 83, 89, 128 | Copilot | SEC | DONE | .github/verification/phase-01-verification.md | N/A | Standardized API envelope + request IDs + login/nearby rate limits active |
| P1-T13 | Implement health endpoint and baseline observability hooks | 126, 127, 229 | Copilot | BE | DONE | .github/verification/phase-01-verification.md | N/A | `/api/health` and `/api/health/ready` implemented |
| P1-T14 | Establish baseline tests for auth, geo, ownership, and critical flows | 111, 112, 113, 114, 115, 263, 264, 265 | Copilot | QA | DONE | .github/verification/phase-01-verification.md | N/A | Unit + integration baseline tests passing under Vitest |

## Rules

- All active-phase scope items must be represented as tasks.
- No task may be omitted because it is small.
- Any BLOCKED task must include blocker notes and a resolution path.
- Phase cannot transition if non-approved open tasks remain.
