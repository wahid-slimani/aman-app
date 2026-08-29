# Database And Data Architecture Rules

## Platform data foundation

- PostgreSQL is primary operational database.
- PostGIS is required for geographic capabilities.
- PostGIS support is prerequisite-validated in Phase 00.

## ORM and geo-query split

- Prisma for standard relational modeling and CRUD.
- Parameterized raw SQL via Prisma for PostGIS-specific operations.
- Never concatenate user input into SQL.

## Geographic data model

Canonical location fields:
- latitude
- longitude
- geography(Point, 4326)

Rules:
- Google Maps URL is not source of truth.
- Coordinates are source of truth.
- Geo column must have GiST index.

## Core entity set

- User
- RefreshSession
- OrganiserProfile
- AidPoint
- AidPointTranslation
- Need
- NeedTranslation
- AidPointNeed
- Category
- CategoryTranslation
- Report
- DatasetVersion
- DatasetChange
- AuditLog
- AnalyticsEvent

## Integrity and lifecycle constraints

- Unique username (normalized strategy).
- Unique public slug/identifier.
- Enum constraints for lifecycle/status.
- Foreign keys and non-null coordinate constraints where required.
- Archive/deactivate/block preferred over delete.

## Shared-hosting optimization rules

- Connection pooling with bounded pool size.
- Keep hottest nearby query highly optimized.
- Select only required columns for map responses.
- Avoid `SELECT *` in performance-critical queries.

## Retention and risk documentation

- Define retention rules for audit/report/analytics/sessions/archived records.
- Explicitly document no automated backup guarantee in v1.
