# Observability And Operations Rules

## Health and diagnostics

- Provide `/api/health`.
- Optionally provide `/api/health/ready` readiness endpoint.
- Do not expose sensitive infra internals in health responses.

## Request correlation

- Attach request ID to every API request/response cycle.
- Use request ID in logs, audit records, and error diagnostics.

## Monitoring domains

Application:
- 4xx rate
- 5xx rate
- latency
- API error classes

Database:
- connection usage
- slow queries
- lock contention
- disk/CPU/memory where available

Product:
- active points
- stale points
- report backlogs
- organiser activity

## Product vs infrastructure boundaries

- Super Admin dashboards expose product/business metrics.
- Infrastructure capacity telemetry remains ops/deployment concern.
- Do not present unavailable hosting-level metrics as product analytics.

## Known operational risk

- v1 has no automated DB backups.
- Dataset versioning and audit trails reduce operational blast radius but are not disaster recovery.
