# Active Phase Task Tracker

Phase: PHASE_05_SECURITY_RELEASE_HARDENING
Updated: 2026-08-29

## Status legend

- TODO
- IN_PROGRESS
- BLOCKED
- DONE

## Task table

| Task ID | Task summary | PRD refs | Owner | Type (UI/BE/DB/SEC/QA) | Status | Evidence links | Skill evidence (UI only) | Blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P5-T01 | Finalize security headers compatible with map/auth architecture | 146, 158, 160 | Copilot | SEC | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T02 | Validate geolocation consent UX/security behavior and localization | 159, 160 | Copilot | UI | DONE | .github/verification/phase-05-verification.md | ui-ux-pro-max + gpt-taste |  |
| P5-T03 | Harden public API validation and abuse defenses | 160, 161 | Copilot | BE | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T04 | Complete CSRF protection for cookie-auth flows | 158, 160, 161 | Copilot | SEC | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T05 | Complete strict CORS enforcement policy | 158, 160 | Copilot | SEC | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T06 | Add security tests (auth/session/rate-limit/injection/xss/csrf) | 111, 112, 113, 114, 115 | Copilot | QA | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T07 | Enforce retention policies for analytics/audit/session data classes | 162, 226, 227 | Copilot | DB | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T08 | Validate migration safety and rollback readiness scripts/checks | 256, 259 | Copilot | DEVOPS | DONE | .github/verification/phase-05-verification.md | N/A |  |
| P5-T09 | Run release hardening gate and resolve critical/high findings | 256, 259 | Copilot | QA | DONE | .github/verification/phase-05-verification.md | N/A |  |

## Rules

- All active-phase scope items must be represented as tasks.
- No task may be omitted because it is small.
- Any BLOCKED task must include blocker notes and a resolution path.
- Phase cannot transition if non-approved open tasks remain.
