# Phase 04 - SEO And Performance Hardening

## Objective

Complete SEO-ready public discovery surfaces and performance hardening without compromising map-first UX, accessibility, or data freshness.

## Scope

- Localized public SEO pages and metadata.
- Sitemap and robots policy.
- Structured data where semantically justified.
- Bundle optimization and dynamic loading hardening.
- Performance test and tuning pass.

## PRD requirements inherited

- 63-68, 140-142, 156-157, 208, 219-220, 255

## Dependencies

- Phase 03 completed.

## Files/modules/features expected

- Public locale aid-point SEO routes and metadata generation.
- Sitemap generation and robots directives.
- Structured data renderer for public aid-point pages.
- Performance tooling scripts/reports and optimization configs.

## Implementation tasks

1. Implement localized indexable aid-point public URLs by locale.
2. Implement localized SEO metadata (title/description/canonical/OG/social).
3. Implement sitemap generation including only public indexable routes.
4. Implement robots directives excluding admin/organiser/private surfaces.
5. Implement structured data aligned with visible content only.
6. Ensure search freshness behavior for closed/archived pages.
7. Optimize bundles with dynamic imports and route-level loading discipline.
8. Validate public rendering performance targets and tune bottlenecks.

## UI/UX requirements

- Preserve map-first homepage behavior.
- Keep public detail pages readable, fast, and localized.
- Ensure SEO surfaces remain responsive and accessible.

## Backend/database requirements

- Efficient fetch paths for SEO page rendering.
- Freshness-aware page status handling.

## Security requirements

- No private route exposure through metadata/sitemap.

## Testing requirements

- Integration tests for sitemap/robots correctness.
- E2E tests for localized SEO page discoverability and content correctness.
- Performance tests for load targets and route-level bundle impacts.

## Verification checklist

- [ ] Localized public SEO pages implemented.
- [ ] Metadata localized and complete.
- [ ] Sitemap excludes private surfaces.
- [ ] Robots policy excludes admin/organiser/private areas.
- [ ] Structured data semantically valid and truthful.
- [ ] Performance and bundle hardening completed.
- [ ] SEO + map coexistence preserved.
- [ ] Phase tests pass.

## Definition of Done

- Public discovery is SEO-ready and performance-hardened while preserving emergency utility and map-centric UX.

## Conditions before next phase

- All checklist items pass.
- No unresolved blocker in SEO correctness or performance targets.
