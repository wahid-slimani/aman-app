# Phase 01 - Core Platform

## Objective

Implement the production foundation of the platform: architecture, auth baseline, role-separated applications, map-first public experience, multilingual system, core APIs, core database model, and core dashboards.

## Scope

- Project structure and architecture skeleton.
- Public map discovery MVP.
- Auth/session baseline with role separation.
- Organiser and Super Admin baseline modules.
- Core entities and APIs.
- Baseline testing, observability, and deployment readiness.

## PRD requirements inherited

- 1-4, 5-16, 17-44, 49-51, 69-71, 72-80, 81-97, 100-101, 105-121, 122-139, 163-171, 172-174, 178-185, 200-207, 215-216, 221-225, 230-235, 270-278, 252

## Dependencies

- Phase 00 completed.

## Files/modules/features expected

- App routes and route groups under `src/app`.
- Public locale routes and map feature module.
- `/admin` and `/organiser` route modules and layouts.
- Auth module and API endpoints (`/api/auth/*`).
- Aid-point read/write APIs and organiser/admin baseline APIs.
- Core domain modules: aid points, organisers, auth.
- Prisma schema and migrations for core entities.
- Geo repository with parameterized PostGIS SQL for nearby query.
- i18n dictionaries and locale middleware/strategy.
- Base design system components and RTL support.
- Base test harness for unit/integration/e2e.

## Implementation tasks

1. Establish Next.js App Router modular monolith structure from PRD guidance.
2. Implement strict TypeScript, linting, formatting, and dependency pinning policy.
3. Implement locale architecture (ar default, fr, tzm) and no-hardcoded-string workflow.
4. Implement auth: login, refresh rotation, logout, blocked-user handling.
5. Implement role and ownership middleware enforcement.
6. Implement core aid-point model with multilingual content and geographic coordinates.
7. Implement nearby query endpoint with radius allowlist and bounded results.
8. Implement map summary and point detail API separation.
9. Implement public map-first UI with GPS optional fallback search and actions.
10. Implement organiser core dashboard and own-point management baseline.
11. Implement Super Admin baseline dashboard + organiser management baseline operations.
12. Implement request ID plumbing, API response standards, and baseline rate limiting.
13. Implement core health endpoint(s) and baseline observability hooks.

## UI/UX requirements

- Public homepage must be map-first and action-first.
- Mobile bottom controls/sheets for map interactions.
- Dashboard responsive patterns for desktop/mobile parity.
- Required UX states present for all implemented features.
- Accessibility baseline and map list alternative included.

## Backend/database requirements

- Core schema constraints (username uniqueness, slug uniqueness, FK validity, status enums).
- Prisma relational usage + parameterized raw SQL for PostGIS paths.
- Spatial index and query optimization for nearby endpoint.

## Security requirements

- Username/password only model.
- Secure token storage architecture and refresh session lifecycle.
- Protected endpoint auth + role + ownership enforcement.
- Sensitive logging restrictions.

## Testing requirements

- Unit tests for auth/radius/status/permission core logic.
- Integration tests for auth lifecycle and nearby query baselines.
- E2E tests for public GPS flow and role login access control baseline.

## Verification checklist

- [ ] Required core architecture directories/modules established.
- [ ] Auth lifecycle works with revocation and block behavior.
- [ ] Public map flow works with GPS and non-GPS search paths.
- [ ] Nearby query enforces radius allowlist and bounded results.
- [ ] API contracts and localized error standards enforced.
- [ ] Organiser ownership restrictions verified.
- [ ] Baseline responsive and accessibility checks pass.
- [ ] Baseline tests pass with no critical regressions.

## Definition of Done

- Phase 01 delivers a functional, localized, secure core platform baseline matching PRD core architecture and behavior.

## Conditions before next phase

- All checklist items pass.
- No critical blocker in core auth, geo query, role separation, or localization.
