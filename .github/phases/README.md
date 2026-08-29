# Phased Execution System

This directory defines strict implementation phases.

## Phase order (mandatory)

1. Phase 00 - Technical Validation
2. Phase 01 - Core Platform
3. Phase 02 - Operational Quality
4. Phase 03 - Analytics
5. Phase 04 - SEO And Performance Hardening
6. Phase 05 - Security And Release Hardening
7. Phase 06 - Final Audit And Launch Readiness

## Gate rule

- A phase must be fully completed and verified before the next phase starts.
- If any phase check fails, phase transition is blocked.

## Required companion files

- Active phase pointer: `active-phase.md`
- Verification template: `../verification/phase-verification-template.md`
- Final audit checklist: `../verification/final-audit-checklist.md`
- Traceability matrix: `../context/traceability-matrix.md`
- Task tracker template: `task-tracking-template.md`
- Phase status log: `phase-status-log.md`

## Skill usage requirement

- UI-related phase tasks must follow `.github/engineering/skill-usage-policy.md`.
