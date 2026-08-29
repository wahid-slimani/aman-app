# .github Development System

This folder is the execution system for building the Algeria Emergency Aid Points Platform from the PRD.

Single source of truth:
- `prd.md` (root)

Strict hierarchy for all implementation work:
1. PRD source of truth (`prd.md`)
2. Global execution rules (`.github/copilot-instructions.md`)
3. Context and requirement catalog (`.github/context/*`)
4. Architecture and design rules (`.github/architecture/*`)
5. Engineering, security, QA, workflow rules (`.github/engineering/*`)
6. Active phase specification (`.github/phases/active-phase.md`)
7. Phase gate and final audit verification (`.github/verification/*`)

## How Copilot must use this system

1. Start every session by reading:
   - `.github/copilot-instructions.md`
   - `.github/phases/active-phase.md`
   - the current phase file referenced by `active-phase.md`
2. Implement only the active phase scope.
3. Enforce sequential phase progression with hard gates.
4. Run phase verification before any phase transition.
5. Update phase evidence and traceability artifacts during implementation.
6. For UI work, follow `.github/engineering/skill-usage-policy.md` and record evidence.

## Folder map

- `context/`
  - Product intent, requirement catalog, role permissions, traceability matrix.
- `architecture/`
  - System, frontend, backend, database, API, auth/security, i18n, UI/UX rules.
- `engineering/`
  - Coding standards, testing strategy, performance/operations, workflow and context rules.
- `phases/`
  - Ordered implementation phases with scope, tasks, dependencies, DoD, gate criteria.
  - Includes task tracker template and phase status log for no-skip execution evidence.
- `verification/`
  - Definition of Done, phase verification template, final audit checklist.

## Non-negotiable rule

No requirement in `prd.md` may be removed, changed, skipped, or contradicted.
