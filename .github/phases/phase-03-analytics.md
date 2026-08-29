# Phase 03 - Analytics

## Objective

Implement product and operational analytics required for Super Admin and Organiser insights while preserving privacy, performance, and metric integrity.

## Scope

- Event taxonomy implementation.
- KPI definitions and dashboard metrics.
- Time-series and geographic analytics views.
- Pre-aggregation strategy.
- Operational alerts.

## PRD requirements inherited

- 45-48, 98-99, 152-155, 175-177, 217-218, 228-229, 244-250, 254

## Dependencies

- Phase 02 completed.

## Files/modules/features expected

- Analytics event capture module and ingestion endpoints.
- KPI computation services and aggregation jobs/materialization strategy.
- Super Admin analytics dashboard routes/components.
- Organiser metrics views.
- Geographic analytics views by wilaya and status slices.
- Alert summary cards/panels in admin overview.

## Implementation tasks

1. Implement event taxonomy and validated event ingestion.
2. Ensure event tracking captures meaningful events only (not map noise).
3. Implement KPI definitions exactly as PRD specifies.
4. Implement time filters: today, 7d, 30d, 90d, custom.
5. Implement geographic analytics metrics by wilaya and verification status.
6. Implement pre-aggregated metric strategy for dashboard query efficiency.
7. Implement organiser effectiveness and activity metrics.
8. Implement operational alerts module for unresolved/high-priority states.
9. Ensure analytics tracking is asynchronous and non-blocking for urgent user actions.

## UI/UX requirements

- Dashboards present clear KPI hierarchy and actionable summaries.
- Metrics are readable and responsive on mobile and desktop.
- Chart usage does not degrade non-analytics page performance.

## Backend/database requirements

- Indexed event tables and aggregate tables/materialized strategy.
- Data minimization and retention-safe event design.

## Security and privacy requirements

- Avoid exact public GPS history storage.
- Avoid unnecessary identifiers or invasive fingerprints.
- Keep analytics purpose focused on operations, not surveillance.

## Testing requirements

- Unit tests for KPI calculations and definition correctness.
- Integration tests for event ingestion and aggregate accuracy.
- E2E tests for dashboard filtering and KPI rendering flows.

## Verification checklist

- [ ] Event taxonomy implemented and validated.
- [ ] KPI definitions align with PRD formulas/semantics.
- [ ] Time-series and geographic analytics available.
- [ ] Pre-aggregation reduces expensive live aggregation load.
- [ ] Alerts area implemented and actionable.
- [ ] Analytics does not block navigation/call/share actions.
- [ ] Privacy constraints are respected.
- [ ] Phase tests pass.

## Definition of Done

- Analytics capabilities provide operational insight with metric integrity and acceptable performance posture.

## Conditions before next phase

- All checklist items pass.
- No unresolved blocker in KPI correctness, privacy, or dashboard usability.
