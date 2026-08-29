# Requirements Catalog (PRD Derived)

This catalog organizes PRD requirements by domain while preserving original intent.

## Functional requirements

- Public map-first discovery flow with optional GPS.
- Radius-constrained nearby search: 10/20/50/100 km.
- Map markers with clustering.
- Two-stage data payload: map summary and detail endpoint.
- Manual location search (wilaya/commune/place).
- Aid-point detail actions: call, navigation, share, report.
- Organiser dashboard and aid-point management.
- Super Admin dashboard with organiser management.
- Publication workflow + operational status handling.
- Reports workflow and moderation.
- Dataset versioning, change history, rollback semantics.
- Audit logs for sensitive operations.
- SEO pages for public aid-point routes and locale URLs.

## Domain and business rules

- Publication status and operational status are separate state machines.
- Required multilingual content completeness is mandatory for publication.
- Aid-point ownership and role authorization are enforced server-side.
- No destructive history rewrites for dataset/audit records.
- Prefer archive/deactivate/block over delete.
- Version rollback creates a new version (no history mutation).

## Authentication and authorization

- Username/password only for authenticated roles in v1.
- Access token short-lived JWT with minimal claims.
- Refresh token rotation with server-side session records.
- Refresh token reuse detection and family/session invalidation.
- Blocking organiser invalidates active sessions.
- Logout revokes refresh session and clears cookie/client access state.

## API and validation

- Standard success/error envelope with stable error codes + localized messages.
- Request ID on each API request.
- Strict input validation on all external inputs.
- Allowlist sort/filter semantics to avoid injection and expensive queries.
- Pagination for admin list endpoints.
- Rate limiting and abuse protection for sensitive and public endpoints.

## Data and database

- PostgreSQL + PostGIS required.
- Coordinates are canonical geographic truth.
- PostGIS GiST index for spatial queries.
- Prisma primary ORM, parameterized raw SQL for PostGIS operations.
- Core entities include User, RefreshSession, AidPoint, translations, reports, dataset, audit, analytics.
- Database invariants enforced with constraints and FKs.

## Frontend and UX

- Mobile-first responsive design from 320px upward.
- Public homepage is product map, not content-heavy marketing page.
- Distinct admin and organiser experiences at `/admin` and `/organiser`.
- Strong loading, empty, error, success, disabled, and validation states.
- Accessibility and RTL requirements are mandatory.
- List equivalent for map accessibility.

## Localization and content

- Default language Arabic.
- Supported locales: ar-DZ, fr-DZ, tzm-DZ.
- No user-visible hard-coded text.
- Backend and validation messages localized.
- Code-managed UI text and DB-managed operational translated content.

## Non-functional requirements

- Performance targets for public render, API, and geo query latency.
- Scalability target 10,000+ points with traffic spikes.
- Shared-host DB limits acknowledged with pressure-minimizing design.
- Observability and health endpoints required.
- Explicit operational risk: no automated backups in v1.

## Testing and quality

- Mandatory unit/integration/E2E strategy.
- Critical security and authorization acceptance coverage.
- Translation and localization acceptance checks.
- Responsive and RTL acceptance checks.
- Release blockers defined in PRD must pass.
