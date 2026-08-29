# Context Management Rules For Long-Running Development

## Objective

Keep implementation accurate over many sessions without reloading full PRD each time.

## Mandatory context loading order

1. `prd.md`
2. `.github/README.md`
3. `.github/copilot-instructions.md`
4. `.github/phases/active-phase.md`
5. Current phase file
6. Linked rule files referenced by current phase
7. `.github/context/traceability-matrix.md`

## Scope discipline

- Work only on current phase requirements.
- If a task belongs to a future phase, document it and defer.
- If a requirement is missing from phase file, use traceability matrix to reconcile before coding.

## Traceability discipline

- Every implementation task references PRD item numbers.
- Every merged unit of work updates:
  - phase checklist
  - verification evidence
  - requirement coverage status

## Drift prevention

- No requirement reinterpretation.
- No contradictory shortcuts.
- No silent scope expansion beyond PRD.

## Session handoff protocol

At session end, update:
- active phase status
- completed requirement IDs
- open blockers
- pending verification tasks
- explicit next action
