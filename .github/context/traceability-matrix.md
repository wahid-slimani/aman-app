# PRD To Phase Traceability Matrix

Purpose: ensure 100% PRD coverage and explicit phase ownership.

Phase keys:
- `P0`: Phase 00 - Technical Validation
- `P1`: Phase 01 - Core Platform
- `P2`: Phase 02 - Operational Quality
- `P3`: Phase 03 - Analytics
- `P4`: Phase 04 - SEO And Performance Hardening
- `P5`: Phase 05 - Security And Release Hardening
- `P6`: Phase 06 - Final Audit And Launch Readiness

## Mapping by PRD numbered items

| PRD items | Primary phase | Notes |
| --- | --- | --- |
| 1-4 | P1 | Product baseline and actor model setup |
| 5-16 | P1 | Auth model, token architecture, admin route separation |
| 17-43 | P1 | Public map UX, organiser core flows, ownership authorization |
| 44 | P1 | Super Admin dashboard foundation |
| 45-48 | P3 | KPI and analytics capabilities |
| 49-51 | P1 | Organiser management core role model |
| 52-59 | P2 | Dataset versioning and audit logging |
| 60-62 | P2 | Reporting workflows and moderation lifecycle |
| 63-68 | P4 | SEO architecture, metadata, sitemap, robots, structured data |
| 69 | P1 | URL and route baseline |
| 70-80 | P1 | Core architecture, state/data management boundaries |
| 81-89 | P1 | API standards and baseline security controls |
| 90-97 | P1 | DB schema invariants and core entities |
| 98-99 | P3 | Analytics event taxonomy and privacy posture |
| 100-101 | P1 | Map provider abstraction and navigation action |
| 102-104 | P0 | Shared hosting prerequisite validation |
| 105-110 | P1 | Query architecture and no-microservice rule |
| 111-121 | P1 | Testing foundation, TS strictness, dependency and environment policy |
| 122-128 | P1 | Deployment baseline, observability and request correlation |
| 129-139 | P1 | Mobile, accessibility, offline baseline, SSR constraints |
| 140-142 | P4 | Performance and scalability validation hardening |
| 143-145 | P0 | Explicit operational risk posture and DR limitation documentation |
| 146 | P5 | Data-retention policy enforcement |
| 147-149 | P2 | Archiving/deactivation/reassignment domain operations |
| 150-151 | P2 | Translation management and static/dynamic content rules |
| 152-155 | P3 | Analytics architecture, pre-aggregates, event capture boundaries |
| 156-157 | P4 | SEO-map coexistence and freshness indexing behavior |
| 158-162 | P5 | Security headers, geolocation consent, public API hardening |
| 163 | P1 | Prisma + parameterized SQL split rule |
| 164-167 | P1 | Server/client rendering and fetching boundaries |
| 168-171 | P1 | Design system baseline, RTL, status accessibility |
| 172-174 | P1 | Organiser creation and password reset baseline |
| 175-177 | P3 | Organiser metrics and operational alerts |
| 178-179 | P1 | Explicit non-requirements (no email/SMS) |
| 180-185 | P1 | Share/navigation/contact privacy/public slug strategy |
| 186 | P2 | Duplicate candidate detection workflow |
| 187-199 | P2 | Data integrity, publication workflow, versioning semantics, concurrency |
| 200-205 | P1 | Pagination/search/map request discipline |
| 206-207 | P1 | Public copy and map-first landing content |
| 208 | P4 | Optional SEO support pages |
| 209-214 | P2 | Data quality, needs lifecycle, opening hours, status semantics |
| 215-216 | P1 | Public ranking and manual search ranking |
| 217-218 | P3 | Analytics capture integrity and non-blocking behavior |
| 219-220 | P4 | Bundle splitting and dynamic imports |
| 221-225 | P1 | Error/loading states and incident messaging baseline |
| 226-227 | P5 | Deployment rollback and migration safety |
| 228-229 | P3 | Product KPI vs infrastructure monitoring separation |
| 230-234 | P1 | Dashboard IA and account management scope |
| 235 | P1 | Multiple Super Admin support |
| 236-237 | P2 | High-risk operation confirmation and destructive-op discipline |
| 238-243 | P2 | Public confidence and verification UX semantics |
| 244-250 | P3 | KPI hierarchy and metric definitions |
| 251 | P0 | Technical validation phase definition |
| 252 | P1 | Core platform phase definition |
| 253 | P2 | Operational quality phase definition |
| 254 | P3 | Analytics phase definition |
| 255 | P4 | SEO/performance hardening phase definition |
| 256 | P5 | Security/release hardening phase definition |
| 257 | P6 | Definition of Done enforcement |
| 258-265 | P6 | MVP/security/data/auth acceptance criteria |
| 266-269 | P6 | Responsive/RTL/translation acceptance + no-static enforcement validation |
| 270-275 | P1 | Stack policy, boundaries, architecture evolution |
| 276-278 | P1 | Final architecture and non-negotiable decisions |

## Cross-phase global controls

These apply to all phases and are gate-checked every phase:
- No requirement drift from PRD.
- Sequential phase-only execution.
- Localization and accessibility rules.
- Regression prevention.
- Security baseline.
- Verification evidence logging.

## Verification links

- Phase gate template: `.github/verification/phase-verification-template.md`
- Final audit checklist: `.github/verification/final-audit-checklist.md`
- Phase specs: `.github/phases/phase-*.md`
