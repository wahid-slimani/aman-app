# Development Workflow And Gate Policy

## Sequential execution rule

- Exactly one active phase at a time.
- No parallel implementation across phases.
- No phase skipping.
- No carry-over of incomplete current-phase requirements.

## Standard execution loop per phase

1. Load context and phase specification.
2. Implement scope items.
3. Run required tests/checks.
4. Validate responsiveness, accessibility, localization, and security constraints.
5. Complete phase verification template.
6. Approve transition only if gate passes.

## Mandatory gate questions (all must pass)

- Were all phase requirements implemented?
- Does functionality actually work end-to-end?
- Do required tests and checks pass?
- Were regressions checked and resolved?
- Is UI responsive and design-system compliant?
- Are security requirements satisfied?
- Does existing functionality still work?
- Is phase DoD satisfied?

## Failure policy

If any gate check fails:
- phase remains active
- missing/failing items are listed as blockers
- transition is forbidden

## Change strategy

- Prefer incremental changes over destructive rewrites.
- Preserve established architecture and behavior unless current phase requires change.
- Keep migration and deployment rollback safety in scope.
