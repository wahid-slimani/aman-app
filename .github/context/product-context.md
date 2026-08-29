# Product Context

## Product identity

- Product: Algeria Emergency Aid Points Platform.
- Type: multilingual, mobile-first web platform.
- Core mission: fastest access to trustworthy, fresh, geographically accurate aid-point information.
- Public interaction target flow: Open -> locate -> nearby points -> inspect point -> call/navigate/share/report.

## Primary actors

- Public user (unauthenticated): discovery and reporting.
- Organiser (authenticated): owns and operates assigned aid points.
- Super Admin (authenticated): full platform governance and operational control.

## Product principles to preserve

1. No public account requirement.
2. GPS optional, not mandatory.
3. Information lifecycle is explicit and auditable.
4. Freshness and verification are first-class.
5. Admin actions are accountable (audit).
6. Backend is multilingual.
7. Dependency versions are pinned.
8. Modular monolith first.

## Strategic priorities

- Accuracy first.
- Freshness second.
- Simplicity third.
- Speed fourth.
- Scalability fifth.

## High-risk constraints

- Shared PostgreSQL hosting constraints (CPU/RAM/connections/I/O).
- PostGIS support is a hard technical prerequisite.
- No automated DB backup in v1 (high operational risk).

## Architectural non-negotiables

- PostgreSQL + PostGIS is geographic source of truth.
- Google Maps is outbound navigation only.
- Access/refresh auth model is revocable with rotation.
- Publication state and operational state are separate.
- Dataset versioning and audit logging are first-class.
- RTK Query and Zustand responsibilities are strictly separated.
