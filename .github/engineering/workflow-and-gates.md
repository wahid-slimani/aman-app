# Development Workflow And Gate Policy

## Sequential execution rule

- Exactly one active phase at a time.
- No parallel implementation across phases.
- No phase skipping.
- No carry-over of incomplete current-phase requirements.

## Standard execution loop per phase

1. Load context and phase specification.
2. Create or update the active phase task tracker from phase scope items.
3. Implement scope items.
4. Mark completed tasks with PRD references and evidence links.
5. Run required tests/checks.
6. Validate responsiveness, accessibility, localization, security constraints, and mandatory UI/UX skill usage.
7. Complete phase verification template.
8. Approve transition only if gate passes.
9. Create a phase completion commit before switching active phase.

## Mandatory gate questions (all must pass)

- Were all phase requirements implemented?
- Does functionality actually work end-to-end?
- Do required tests and checks pass?
- Were regressions checked and resolved?
- Is UI responsive and design-system compliant?
- Were required UI/UX skills used and documented for UI work?
- Are security requirements satisfied?
- Does existing functionality still work?
- Is phase DoD satisfied?
- Are all active-phase tasks closed or formally blocked with approval?

## Failure policy

If any gate check fails:
- phase remains active
- missing/failing items are listed as blockers
- transition is forbidden

## Phase-end commit policy (mandatory)

- After a phase passes verification, create exactly one phase completion commit before updating to the next phase.
- Commit must include:
	- phase ID
	- PRD references completed
	- verification artifact path
- Suggested commit format:
	- `phase(<PHASE_ID>): complete and gate-approved`
- Do not start next-phase implementation before this commit exists.

## Active-phase task tracking rule

- Use `.github/phases/task-tracking-template.md` as the source format.
- Task tracker must include: task ID, PRD references, owner, status, evidence.
- Allowed statuses: TODO, IN_PROGRESS, BLOCKED, DONE.
- `BLOCKED` status requires explicit blocker description and resolution plan.

## Change strategy

- Prefer incremental changes over destructive rewrites.
- Preserve established architecture and behavior unless current phase requires change.
- Keep migration and deployment rollback safety in scope.
