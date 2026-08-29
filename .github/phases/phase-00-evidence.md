# Phase 00 Technical Validation Evidence

Date: 2026-08-29
Phase: PHASE_00_TECHNICAL_VALIDATION

## 1) Local environment checks executed

Command evidence summary:
- `psql`: found at `C:\Program Files\PostgreSQL\17\bin\psql.exe`
- `pg_isready`: not in PATH (not required after direct `psql` use)
- `Test-NetConnection localhost:5432`: `TcpTestSucceeded=True`
- DB identity query: success (`db=aman`, `usr=postgres`)
- PostGIS installer downloaded: `postgis-bundle-pg17x64-setup-3.6.2-1.exe`
- PostGIS extension files present: `postgis.control` found
- `CREATE EXTENSION IF NOT EXISTS postgis`: success
- `SELECT PostGIS_Version()`: success (`3.6 ...`)
- `SELECT extname, extversion FROM pg_extension WHERE extname='postgis'`: success (`3.6.2`)
- `SHOW max_connections`: `100`
- `SHOW shared_buffers`: `128MB`

Interpretation:
- PostgreSQL service is reachable and authenticated for local development DB.
- PostGIS is now installed and configured successfully on local PostgreSQL 17.
- Geographic architecture prerequisite is satisfied for local development.

## 2) PostGIS verification result

Run these SQL statements in pgAdmin against database `aman`:

```sql
SELECT current_database() AS db, current_user AS usr;
SELECT extname FROM pg_extension WHERE extname = 'postgis';
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

Observed successful evidence:
- Extension control file exists in PostgreSQL extension directory.
- Extension creation succeeds.
- `PostGIS_Version()` returns valid version info.

## 3) Phase 00 blockers discovered

Resolved:
- Map tile provider selected.
- Domain and HTTPS target confirmed.
- Shared-host-like capacity constraints documented from measured DB values.

Remaining note:
- When migrating to actual shared hosting production DB, re-run the same capacity queries and record provider-specific limits.

## 4) Confirmed architectural feasibility items

- Architecture already aligned with PRD rule:
  - Prisma for relational data.
  - Parameterized raw SQL for PostGIS-specific operations.
- Documented in `.github/architecture/database-architecture.md`.

## 5) Next actions to clear blockers

1. Re-validate production-host limits at deployment time.
2. Keep connection pooling conservative from day one.

## 6) Hard-blocker decision note

PostGIS support is confirmed for local development. Phase 01 remains blocked only by unresolved non-PostGIS Phase 00 prerequisites.

## 7) Map provider decision

Selected provider for v1:
- MapTiler Cloud tiles used via MapLibre.

Why this fits PRD and your constraints:
- No complex infrastructure installation.
- Fast integration with MapLibre.
- Free tier is practical for MVP and paid scaling path exists.
- Good production ergonomics for caching and global delivery.

Operational rule:
- Keep provider token in server/local environment variables (not in Git).

## 8) Domain and HTTPS decision

Confirmed deployment domain:
- `aman-app.vercel.app`

TLS/HTTPS:
- Vercel-managed HTTPS is used for this domain.

## 9) Shared-host constraint discovery (measured baseline)

Measured on current PostgreSQL environment:
- `max_connections = 100`
- `shared_buffers = 128MB`
- `work_mem = 4MB`
- `maintenance_work_mem = 64MB`
- `effective_cache_size = 4GB`

Implications applied to architecture:
- Enforce conservative connection pooling and short-lived queries.
- Optimize nearby geo query path first.
- Avoid unnecessary heavy aggregations on operational tables.
