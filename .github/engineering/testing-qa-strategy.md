# Testing And QA Strategy

## Mandatory testing layers

- Unit tests: business logic and rules.
- Integration tests: API + DB + auth flows.
- E2E tests: critical user journeys.

## High-priority unit coverage

- Radius validation and allowed values.
- Geo distance and sorting rules.
- Status transitions and lifecycle rules.
- Freshness classification logic.
- Translation fallback/completeness rules.
- Permission and ownership checks.
- Dataset version and audit event generation.
- Token rotation/reuse logic.
- Report deduplication logic.
- Slug generation stability.

## High-priority integration coverage

- Auth lifecycle: login/refresh/logout/block/revocation/reuse.
- Aid-point CRUD/publication/archive/ownership.
- Geo queries for all allowed radii.
- Report submit/rate-limit/admin workflow.
- Dataset version publish/rollback behavior.

## High-priority E2E journeys

- Public Arabic map flow with GPS + actions.
- Public fallback search without GPS.
- Organiser management flow from login to verify/logout.
- Super Admin flow including create organiser, block, audit, dataset history.

## Acceptance dimensions

- Responsive breakpoints.
- RTL behavior.
- No untranslated user-visible content.
- Security and authorization behavior.

## Coverage philosophy

- Prioritize confidence in critical business/security paths over arbitrary percent targets.
