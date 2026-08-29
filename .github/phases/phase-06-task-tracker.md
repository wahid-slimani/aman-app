# Active Phase Task Tracker

Phase: PHASE_06_FINAL_AUDIT_AND_LAUNCH_READINESS
Updated: 2026-08-29

## Status legend

- TODO
- IN_PROGRESS
- BLOCKED
- DONE

## Task table

| Task ID | Task summary | PRD refs | Owner | Type (UI/BE/DB/SEC/QA) | Status | Evidence links | Skill evidence (UI only) | Blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P6-T01 | Execute final regression across public/organiser/admin journeys | 257, 258, 259 | Copilot | QA | DONE | .github/verification/phase-06-verification.md | N/A |  |
| P6-T02 | Validate MVP critical blocker list from final checklist | 258, 259, 260, 261 | Copilot | QA | DONE | .github/verification/phase-06-verification.md | N/A |  |
| P6-T03 | Validate authentication/authorization/session acceptance criteria | 262, 263, 264 | Copilot | SEC | DONE | .github/verification/phase-06-verification.md | N/A |  |
| P6-T04 | Validate dataset versioning and rollback semantics | 265 | Copilot | BE | DONE | .github/verification/phase-06-verification.md | N/A |  |
| P6-T05 | Validate geo boundary correctness for allowed radii | 266 | Copilot | QA | DONE | .github/verification/phase-06-verification.md | N/A |  |
| P6-T06 | Validate responsive + RTL + translation/no-static acceptance | 267, 268, 269 | Copilot | UI | DONE | .github/verification/phase-06-verification.md | ui-ux-pro-max + gpt-taste |  |
| P6-T07 | Run final suites: lint/typecheck/unit/integration/e2e/perf/build/security | 257, 259 | Copilot | QA | DONE | .github/verification/phase-06-verification.md | N/A |  |
| P6-T08 | Produce final go/no-go report and close project phase state | 257-269 | Copilot | PM | DONE | .github/verification/final-audit-checklist.md | N/A |  |

## Rules

- All active-phase scope items must be represented as tasks.
- No task may be omitted because it is small.
- Any BLOCKED task must include blocker notes and a resolution path.
- Phase cannot transition if non-approved open tasks remain.
