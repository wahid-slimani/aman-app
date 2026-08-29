# Phase 02 - Operational Quality

## Objective

Implement operational trust and governance capabilities: verification lifecycle, reports, publication workflow quality gates, dataset versioning, audit immutability behaviors, duplicate candidate detection, concurrency safety, and non-destructive operations.

## Scope

- Data quality and verification systems.
- Report intake and review workflow.
- Dataset version and change-tracking model.
- Audit logging maturity.
- Publication/operational state separation in full workflow.
- Concurrency conflict handling.

## PRD requirements inherited

- 52-62, 147-151, 186-199, 209-214, 236-243, 253

## Dependencies

- Phase 01 completed.

## Files/modules/features expected

- Domain modules for dataset versioning and audit logs.
- Report workflow modules and admin review interfaces.
- Publication state and operational state policy layer.
- Duplicate detection rule module and admin flagging UI.
- Concurrency/version conflict backend checks + UI conflict messages.
- Verification timestamp/history module and stale-state classification.

## Implementation tasks

1. Implement verification action/history and freshness classification thresholds.
2. Implement stale-data state rules and admin-configurable thresholds.
3. Implement public report submission with abuse controls.
4. Implement admin report workflow: open, under review, resolved, dismissed.
5. Implement dataset version model and dataset change records.
6. Implement rollback semantics that create new version/change set.
7. Implement append-only audit logging for sensitive operations.
8. Implement publication workflow and approval path.
9. Enforce publication prerequisites (translations, coordinates, contact, status, ownership).
10. Implement non-destructive lifecycle operations (archive/block/deactivate preference).
11. Implement ownership transfer with required audit event.
12. Implement optimistic concurrency checks and stale-write rejection.

## UI/UX requirements

- Clear verification and freshness indicators.
- Clear high-risk action confirmations.
- Conflict resolution feedback (reload/compare workflow baseline).
- Report moderation states with actionable cues.

## Backend/database requirements

- Transactional boundaries for state update + audit + dataset change where required.
- Immutable-semantics audit write strategy from application layer.
- Dataset changes reference public operational state only.

## Security requirements

- Report abuse prevention and rate limiting.
- Strict authorization for review/versioning/rollback/admin actions.
- High-risk operation confirmation enforcement.

## Testing requirements

- Unit tests: versioning semantics, stale classification, publication gating, concurrency checks.
- Integration tests: report workflow, dataset publish/rollback, audit/event consistency.
- E2E tests: organiser submit/verify/publish and admin review/rollback/ownership transfer.

## Verification checklist

- [ ] Verification and stale-state behavior implemented and visible.
- [ ] Report lifecycle works with anti-abuse controls.
- [ ] Dataset version history and rollback semantics verified.
- [ ] Audit trail captures required events and fields.
- [ ] Publication vs operational state separation enforced.
- [ ] Concurrency conflicts detected and safely handled.
- [ ] Non-destructive operation policy applied.
- [ ] Phase tests pass with no major regressions.

## Definition of Done

- Operational quality and governance mechanisms are in place and enforceable according to PRD.

## Conditions before next phase

- All checklist items pass.
- No unresolved blocker in versioning, audit, publication quality, or conflict safety.
