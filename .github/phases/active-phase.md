# Active Phase Control

Current phase: `PHASE_01_CORE_PLATFORM`

Status:
- state: NOT_STARTED
- startedAt: TBD
- completedAt: TBD

Rules:
- Only requirements assigned to current phase may be implemented.
- Transition requires completed verification artifact and gate pass.
- Active phase must maintain a task tracker using `.github/phases/task-tracking-template.md`.
- Phase start and phase end decisions must be recorded in `.github/phases/phase-status-log.md`.

Transition protocol:
1. Complete current phase checklist.
2. Complete `.github/verification/phase-verification-template.md` for current phase.
3. Confirm task tracker has no unresolved non-approved tasks.
4. Confirm no blockers remain.
5. Create the phase completion commit with phase ID + PRD refs + verification artifact path.
6. Update this file to next phase.
