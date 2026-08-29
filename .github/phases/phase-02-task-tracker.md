# Active Phase Task Tracker

Phase: PHASE_02_OPERATIONAL_QUALITY
Updated: 2026-08-29 (implementation slice 3)

## Status legend

- TODO
- IN_PROGRESS
- BLOCKED
- DONE

## Task table

| Task ID | Task summary | PRD refs | Owner | Type (UI/BE/DB/SEC/QA) | Status | Evidence links | Skill evidence (UI only) | Blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P2-T01 | Implement verification action/history and freshness classification thresholds | 52, 53, 57, 58, 147, 148, 149 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Verification event model + verify API + freshness utility in use |
| P2-T02 | Implement stale-data state rules and admin-configurable thresholds | 52, 55, 56, 150, 151 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Persistent threshold settings model + admin API + admin panel controls implemented |
| P2-T03 | Implement public report submission with abuse controls | 59, 60, 61, 62, 186 | Copilot | SEC | DONE | .github/verification/phase-02-verification.md | N/A | Public report POST + baseline IP rate limit implemented |
| P2-T04 | Implement admin report workflow: open, under review, resolved, dismissed | 187, 188, 189, 192, 193 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Admin report list and status review API endpoints implemented |
| P2-T05 | Implement dataset version model and dataset change records | 194, 195, 196, 236, 237 | Copilot | DB | DONE | .github/verification/phase-02-verification.md | N/A | DatasetVersion and DatasetChange models + workflow helper active |
| P2-T06 | Implement rollback semantics that create new version/change set | 197, 198, 199, 238 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Admin rollback endpoint creates new dataset version change |
| P2-T07 | Implement append-only audit logging for sensitive operations | 209, 210, 211, 212 | Copilot | SEC | DONE | .github/verification/phase-02-verification.md | N/A | Audit writes now cover moderation, verify, status update, publication, transfer, rollback |
| P2-T08 | Implement publication workflow and approval path | 213, 214, 239, 240 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Organiser submit-review + admin publication decision endpoints implemented |
| P2-T09 | Enforce publication prerequisites (translations, coordinates, contact, status, ownership) | 90, 91, 92, 93, 241, 242 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Publication prerequisite policy check integrated in submit and publish endpoints |
| P2-T10 | Implement non-destructive lifecycle operations (archive/block/deactivate preference) | 243, 253 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Archive action implemented in publication workflow without hard delete |
| P2-T11 | Implement ownership transfer with required audit event | 43, 161, 190, 191 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | Admin ownership transfer endpoint with dataset change + audit event |
| P2-T12 | Implement optimistic concurrency checks and stale-write rejection | 57, 58, 214 | Copilot | BE | DONE | .github/verification/phase-02-verification.md | N/A | expectedVersion conflict checks with 409 response implemented |
| P2-T13 | Implement admin and organiser UI cues for freshness, reports, and conflict states | 130, 131, 132, 133, 134, 135, 136 | Copilot | UI | DONE | .github/verification/phase-02-verification.md | ui-ux-pro-max + gpt-taste | Admin operational panel + organiser freshness/action panel with loading, empty, error, success, disabled states |
| P2-T14 | Add unit/integration coverage for report workflow, verification, audit, and concurrency | 111, 112, 113, 114, 115 | Copilot | QA | DONE | .github/verification/phase-02-verification.md | N/A | Added integration tests for organiser concurrency path and admin publication prerequisite gate; suite now 23 passing tests |

## Rules

- All active-phase scope items must be represented as tasks.
- No task may be omitted because it is small.
- Any BLOCKED task must include blocker notes and a resolution path.
- Phase cannot transition if non-approved open tasks remain.
