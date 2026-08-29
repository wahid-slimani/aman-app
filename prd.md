# PRD — Algeria Emergency Aid Points Platform

## 1. Product overview

### Product type

A multilingual, mobile-first web platform for discovering and managing **humanitarian aid collection points across Algeria**.

### Primary purpose

Allow anyone to open the website and immediately discover nearby verified aid-collection locations using an interactive map and their current geographic position.

The user should be able to:

> Open → locate → see nearby points → inspect a point → contact/navigate.

No registration is required for public users.

### Administrative purpose

Provide a secure administration system through which:

* Super Admins manage the entire platform.
* Organisers manage their own aid points.
* Super Admins manage organiser accounts.
* Super Admins can block/unblock organisers.
* Platform statistics and operational KPIs are monitored.
* Dataset versions and changes are controlled and auditable.

---

# 2. Product vision

The platform should become the **trusted geographic directory of active humanitarian collection points**.

Its most important characteristic is not feature richness.

It is:

> **fast access to trustworthy, current geographic information.**

The platform must therefore prioritize:

**accuracy → freshness → simplicity → speed → scalability.**

---

# 3. Core product principles

### Principle 1 — No public account

A person needing information should never have to register.

### Principle 2 — Location is optional

GPS dramatically improves the experience but must never be mandatory.

### Principle 3 — Information has a lifecycle

An aid point is not simply "created".

It is:

```text
DRAFT
→ PUBLISHED
→ ACTIVE
→ NEEDS_REVIEW
→ CLOSED / TEMPORARILY_CLOSED
→ ARCHIVED
```

### Principle 4 — Every operational record has freshness

The system must always know:

> when this information was last verified.

### Principle 5 — Administrators are accountable

Every sensitive administrative modification must be auditable.

### Principle 6 — Backend is multilingual too

There must be **no untranslated backend business messages**.

Validation messages, API errors, authentication responses, notifications and system messages must support the same localization architecture.

### Principle 7 — No uncontrolled dependency versions

Dependencies are explicitly pinned through the package manager lockfile.

### Principle 8 — Modular monolith first

The application should be architecturally scalable without prematurely introducing microservices.

---

# 4. Actors

## 4.1 Public user

Unauthenticated visitor.

Permissions:

* View active aid points.
* Search locations.
* Use GPS.
* Filter radius.
* Filter categories.
* Open aid-point details.
* Call.
* Open Google Maps.
* Share.
* Report incorrect information.

No write access except submitting reports.

---

## 4.2 Organiser

Authenticated operational user responsible for one or more aid points.

Permissions:

* Login.
* View own dashboard.
* Create aid points.
* Edit own aid points.
* Update operational status.
* Update needs.
* Update contact information.
* Mark information as verified.
* View own statistics.

Restrictions:

* Cannot manage other organisers.
* Cannot manage super admins.
* Cannot access global platform analytics.
* Cannot modify system settings.
* Cannot bypass publication rules.
* Can be blocked by Super Admin.

---

## 4.3 Super Admin

Full platform administrator.

Permissions:

* Manage organisers.
* Create organiser accounts.
* Block/unblock organisers.
* Reset organiser credentials.
* Manage all aid points.
* Override organiser changes.
* Approve/reject publication.
* Manage taxonomy/categories/needs.
* Manage translations.
* View platform KPIs.
* Inspect audit logs.
* View dataset versions.
* Roll back eligible datasets.
* Manage system configuration.

---

# 5. Authentication model

The authentication system is explicitly:

> **Username + password only.**

No:

* email verification
* phone verification
* OTP
* social login
* magic links

for v1.

---

# 6. JWT architecture

Use:

### Access token

Short-lived JWT.

Purpose:

* authorize API requests
* identify user
* carry role and minimal authorization claims

### Refresh token

Longer-lived token used to obtain a new access token.

The refresh-token design should **not** simply be a permanent JWT that is trusted forever.

Use:

```text
Refresh token
      ↓
rotation
      ↓
server-side token/session record
      ↓
new refresh token
```

This permits revocation and detects token reuse.

---

# 7. Recommended token model

Access token:

```text
JWT
short TTL
```

Contains only minimal claims:

```text
sub
role
sessionId
iat
exp
```

Do not place sensitive user information inside it.

Refresh token:

* long-lived
* securely stored
* associated with a server-side session/token record
* rotated after refresh
* revocable
* invalidated when organiser is blocked
* invalidated during explicit logout where appropriate

---

# 8. JWT storage

Avoid storing long-lived authentication material in normal `localStorage`.

Recommended web architecture:

### Access token

Prefer in-memory client state.

### Refresh token

Use a secure, HttpOnly cookie.

Cookie should use appropriate:

```text
Secure
HttpOnly
SameSite
```

attributes.

This substantially reduces exposure to token theft through client-side script.

---

# 9. Authentication flows

## Login

```text
Username
Password
    ↓
POST /auth/login
    ↓
Validate credentials
    ↓
Check account active
    ↓
Create session
    ↓
Issue access token
    ↓
Set refresh cookie
```

Return generic authentication errors.

Do not reveal:

> username exists but password is wrong

versus:

> username doesn't exist.

---

# 10. Refresh flow

```text
Access token expires
        ↓
Refresh endpoint
        ↓
Validate refresh token/session
        ↓
Rotate refresh token
        ↓
Issue new access token
        ↓
Continue
```

Refresh-token reuse should invalidate the relevant token family/session.

---

# 11. Logout

Logout should:

* invalidate the server-side refresh session
* clear the refresh cookie
* clear client access state

---

# 12. Blocked organiser behavior

When Super Admin blocks an organiser:

```text
organiser.isActive = false
```

and all active refresh sessions for that organiser are invalidated.

Therefore the organiser cannot remain authenticated simply because they previously obtained a token.

This is critical.

---

# 13. Password security

Passwords must be hashed using a modern password hashing algorithm.

Never store:

```text
plaintext password
encrypted password
reversible password
```

Use a strong memory-hard/password hashing approach appropriate to the current Node.js ecosystem.

Passwords must never appear in logs.

---

# 14. Registration

Public registration:

> **Disabled.**

Only Super Admin creates organiser accounts.

This avoids fake organiser creation and greatly reduces abuse.

---

# 15. Username requirements

Usernames should have:

* minimum length
* maximum length
* allowed character set
* normalized comparison
* uniqueness

Prevent confusing duplicate usernames caused by capitalization or Unicode edge cases.

---

# 16. Admin domains

Two separate administrative experiences:

```text
/admin
```

for Super Admin.

```text
/organiser
```

for Organisers.

Do not rely solely on hiding navigation.

Authorization must be enforced server-side.

---

# 17. Public application requirements

The public application is:

> **Map-first.**

The homepage should not feel like a traditional corporate website.

The map is the product.

---

# 18. Public homepage

### Desktop

```text
┌─────────────────────────────────────────────────────┐
│ Logo        Search      Radius      Language        │
├─────────────────────────────────────────────────────┤
│                                                     │
│                     MAP                             │
│                                                     │
│              ●        ●                             │
│          ●              ●                           │
│                                                     │
│                     ●                               │
│                                                     │
│                         [ Near me ]                 │
├─────────────────────────────────────────────────────┤
│ Nearby points / selected point details              │
└─────────────────────────────────────────────────────┘
```

### Mobile

Map occupies most of the viewport.

Bottom controls provide:

* radius
* filters
* list
* selected point details

---

# 19. Default language

Default:

**Arabic**

Languages:

* العربية
* Français
* Tamazight

Locale architecture must support:

```text
ar-DZ
fr-DZ
tzm-DZ
```

The actual Tamazight locale/script strategy must be standardized before implementation.

---

# 20. Full internationalization requirement

"No static content" means:

> **No user-visible hard-coded string may exist anywhere in the application.**

This includes:

* frontend
* backend
* APIs
* validation
* errors
* authentication
* dashboards
* empty states
* loading states
* metadata
* SEO
* notifications
* confirmation dialogs
* accessibility labels
* map controls created by the application
* report reasons
* status labels
* category labels

---

# 21. Translation architecture

Use a centralized translation system.

Conceptually:

```text
/locales
   /ar
   /fr
   /tzm
```

and translation keys such as:

```text
aidPoint.status.active
aidPoint.status.closed
auth.invalidCredentials
auth.accountBlocked
report.reason.closed
validation.required
dashboard.organiserCount
```

Never:

```ts
if (...) return "Invalid password";
```

Instead:

```ts
return translate("auth.invalidCredentials", locale);
```

---

# 22. Backend localization

Every API request that can produce human-readable text should accept or infer locale.

For example:

```http
Accept-Language: ar
```

or locale derived from the authenticated request/client.

The backend returns stable machine-readable error codes plus localized messages.

Example:

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "بيانات تسجيل الدخول غير صحيحة"
}
```

The `code` is stable.

The `message` is localized.

This makes frontend behavior robust while keeping the API multilingual.

---

# 23. User-generated / operational content

Aid-point content itself must also be multilingual.

An organiser creating a point should provide:

```text
Arabic
French
Tamazight
```

for the content that must be public.

Do not silently translate operational data with AI in the database.

The UI should enforce completeness where required.

---

# 24. Translation completeness rules

For required fields:

```text
Arabic       REQUIRED
French       REQUIRED
Tamazight    REQUIRED
```

For optional fields:

all locales remain optional.

The system must clearly identify missing translations before publication.

---

# 25. Aid point entity

Each aid point should contain:

### Identity

* internal ID
* public stable identifier
* multilingual name
* multilingual description

### Location

* latitude
* longitude
* PostGIS point
* multilingual address
* wilaya
* commune

### Contact

* primary phone
* secondary phone
* optional WhatsApp
* optional other contact method

### Operations

* status
* opening hours
* operational notes
* verification timestamp

### Needs

* accepted categories
* currently requested items
* priority

### External navigation

* Google Maps URL
* validated coordinates

### Ownership

* organiser
* created by
* updated by

### Lifecycle

* created
* updated
* published
* archived

---

# 26. Location ingestion

Organiser provides:

> Google Maps link

The system should:

1. Validate the URL.
2. Extract location where possible.
3. Display coordinates on an admin map.
4. Allow organiser to correct marker position.
5. Require explicit confirmation.
6. Store structured coordinates.

The Google Maps URL is **not the source of truth**.

Coordinates are.

---

# 27. Why coordinates are canonical

A Google Maps URL is a presentation/navigation mechanism.

The system needs geographic data for:

* radius queries
* distance calculations
* sorting
* spatial filtering
* clustering
* analytics

Therefore the database must store:

```text
latitude
longitude
geography(Point, 4326)
```

---

# 28. PostGIS + Prisma requirement

Use PostgreSQL with PostGIS.

Prisma should remain the primary ORM.

However, there is an important implementation constraint: Prisma does not natively model all PostGIS geographic operations as normal Prisma Client operations. Prisma's own documentation describes geographic fields as `Unsupported` and recommends raw SQL via `$queryRaw`/`$executeRaw` when working with PostGIS. ([Prisma][2])

Therefore the architecture should be:

```text
Prisma ORM
      +
validated typed SQL
      +
PostGIS
```

not:

> "Force every spatial query through standard Prisma CRUD."

For geographic queries, use controlled SQL repositories with strict parameterization.

---

# 29. Geographic querying

Primary public query:

```text
user latitude
user longitude
radius
```

Supported radius:

```text
10 km
20 km
50 km
100 km
```

No arbitrary radius from the public API.

---

# 30. Nearby-query algorithm

```text
GPS
 ↓
Validate coordinates
 ↓
Validate allowed radius
 ↓
PostGIS ST_DWithin
 ↓
Calculate distance
 ↓
Filter operational records
 ↓
Sort by distance
 ↓
Limit result
 ↓
Return compact map payload
```

PostGIS spatial indexing should be used for the geographic column.

---

# 31. Result limits

Never return every aid point.

Map endpoint should have a bounded result set.

For example:

```text
max 200
```

or an appropriately tuned value after load testing.

The exact limit is an engineering configuration, not a hardcoded product promise.

---

# 32. Marker clustering

Map markers must be clustered.

At national or regional zoom:

```text
[126]
```

Then:

```text
[28]
```

Then individual points.

This is required for usability and map performance.

---

# 33. Two-stage API data

### Map response

Minimal:

```text
id
coordinates
name
status
distance
urgent needs
last verified
```

### Detail response

Full:

```text
description
address
phone
opening hours
needs
organisation
verification
navigation link
```

This prevents unnecessarily large responses.

---

# 34. Public filters

### Mandatory

Radius:

```text
10
20
50
100 km
```

### Recommended

Category:

```text
Food
Water
Clothing
Hygiene
Medical supplies
Blankets
Children supplies
General
```

### Status

Default:

> Active only

Closed locations should not appear in normal nearby results.

---

# 35. Search

Manual search must work without GPS.

Search by:

* Wilaya
* Commune
* place name

Potentially later:

* address

When a location is selected:

```text
center map
+
execute nearby query
```

---

# 36. User-location privacy

The platform should **not persist public users' exact GPS locations**.

The intended flow:

```text
Browser obtains position
       ↓
API request
       ↓
query database
       ↓
response
```

Do not create a location history for anonymous visitors.

---

# 37. Public point detail

A selected point should appear as a bottom sheet on mobile.

Example:

```text
مركز جمع المساعدات

🟢 مفتوح

على بعد 4.8 كم

يحتاج حالياً إلى:

المياه — عاجل
الأغطية — مرتفع
المواد الغذائية — عادي

آخر تحقق:
منذ 45 دقيقة

[ اتصال ]
[ فتح في Google Maps ]
[ مشاركة ]
```

---

# 38. Information freshness

Every operational aid point needs:

```text
lastVerifiedAt
```

Display human-readable freshness.

Examples:

> Verified 30 minutes ago

> Verified today

> Information requires verification

The UI should never hide stale information.

---

# 39. Automatic stale-data state

Recommended configurable rules:

```text
< 12h     current
12–24h    aging
24–72h    warning
> 72h     needs verification
```

Thresholds should be configurable by Super Admin.

---

# 40. Organiser dashboard

The organiser dashboard must be fully responsive.

Main cards:

```text
My active points
Points needing verification
Temporarily closed
Total views
Navigation clicks
Calls
Reports
```

Then:

> My aid points

table/list.

---

# 41. Organiser point-management interface

Mobile:

```text
My points

● Centre 1
  Open
  Verified 20 min ago

● Centre 2
  Needs verification
```

Desktop can use a richer table.

Both interfaces must use the same underlying domain operations.

---

# 42. Organiser quick actions

For every own point:

```text
Edit
Update status
Update needs
Verify information
View public page
```

Status changes should be quick.

For emergency operation, an organiser should not have to navigate through several forms merely to say:

> "We are temporarily closed."

---

# 43. Organiser restrictions

An organiser may only modify records they own.

Authorization must be checked in the backend:

```text
authenticated user
+
role = ORGANISER
+
aidPoint.organiserId = currentUser.id
```

Never rely on frontend filtering to enforce ownership.

---

# 44. Super Admin dashboard

This is a first-class product module.

The Super Admin homepage should provide an operational overview.

---

# 45. Super Admin KPIs

Core KPIs:

### Aid points

* Total
* Active
* Temporarily closed
* Archived
* Needs verification

### Organisers

* Total
* Active
* Blocked
* Recently created
* Recently active

### Public usage

* Visits
* Nearby searches
* Aid-point views
* Navigation clicks
* Calls/click-to-call
* Shares
* Reports

### Data quality

* Verification coverage
* stale-point ratio
* missing translation ratio
* reported-point ratio
* duplicate candidates

---

# 46. Time-based analytics

The Super Admin should be able to view:

```text
Today
7 days
30 days
90 days
Custom period
```

Charts:

* visits over time
* point views
* searches
* navigation actions
* reports
* active locations

---

# 47. Geographic analytics

Useful Super Admin view:

```text
Aid points by wilaya
```

and:

```text
Active points by wilaya
```

and:

```text
Unverified points by wilaya
```

This reveals geographic coverage gaps.

---

# 48. Operational coverage KPI

A valuable KPI:

> **Active verified aid points**

rather than simply total aid points.

Potential indicator:

```text
verified_active / total_active
```

This measures actual information quality.

---

# 49. Organiser management

Super Admin view:

```text
Organiser
Username
Status
Aid points
Last activity
Created
```

Actions:

```text
View
Block
Unblock
Reset password
Deactivate
```

---

# 50. Blocking confirmation

Blocking must require explicit confirmation.

Display impact:

> Blocking this organiser will prevent login and invalidate their active sessions.

This prevents accidental operational disruption.

---

# 51. Organiser access levels

For now:

```text
SUPER_ADMIN
ORGANISER
```

Architecturally leave room for:

```text
MODERATOR
REGIONAL_ADMIN
```

but do not implement unnecessary roles in v1.

---

# 52. Dataset versioning

This is one of the most important new requirements.

The aid-point dataset needs a controlled version history.

---

# 53. Dataset version model

Create:

```text
DatasetVersion
```

with:

```text
id
versionNumber
createdAt
createdBy
description
status
```

Possible states:

```text
DRAFT
PUBLISHED
SUPERSEDED
ROLLED_BACK
```

---

# 54. What dataset versioning means

A dataset version represents the publicly recognized state of the operational dataset.

For example:

```text
Version 12
    147 active points

Version 13
    + 8 points
    - 2 closed
    ~ 17 modified
```

The system retains the historical changes.

---

# 55. Recommended version semantics

Every change should be represented by an audit/event record:

```text
CREATE
UPDATE
STATUS_CHANGE
NEEDS_CHANGE
LOCATION_CHANGE
TRANSLATION_CHANGE
ARCHIVE
RESTORE
```

A published dataset version references the set of changes included in that release.

---

# 56. Version history UI

Super Admin should see:

```text
Dataset v18
Published:
29 Aug 2026 09:20

Created: 5
Updated: 21
Closed: 3
Restored: 1

By:
Super Admin

[View changes]
```

---

# 57. Dataset rollback

Rollback should be supported for administrative recovery.

A rollback should not destructively delete history.

Instead:

```text
Version 18
   ↓
rollback operation
   ↓
new Version 19
```

Version 18 remains historical.

This is much safer than literally rewriting history.

---

# 58. Audit logging

Audit log is separate from dataset versioning.

It must capture:

* authentication events
* organiser creation
* organiser block/unblock
* point creation
* point update
* status changes
* location changes
* need changes
* translations
* publication
* rollback

Include:

```text
actor
timestamp
entity
action
before
after
requestId
```

Potentially include IP address where operationally appropriate and legally justified.

---

# 59. Audit-log immutability principle

Application users must not be able to casually modify or delete audit records.

Audit logs should be append-only from the application perspective.

---

# 60. Reporting system

Public users can report:

* location closed
* wrong phone
* wrong coordinates
* incorrect information
* duplicate
* other

No authentication required.

---

# 61. Report abuse prevention

Since reporting is unauthenticated:

* rate-limit reports
* normalize requests
* prevent duplicate report spam
* optionally fingerprint submissions
* never automatically delete content from one report

Super Admin reviews reports.

---

# 62. Report workflow

```text
PUBLIC
  ↓
REPORT
  ↓
OPEN
  ↓
UNDER_REVIEW
  ↓
RESOLVED / DISMISSED
```

---

# 63. SEO strategy

SEO is important primarily for:

* aid-point individual pages
* location pages
* useful public discovery pages

Not for:

* admin
* organiser dashboards
* authenticated pages
* private API routes

Next.js supports structured metadata, robots controls and sitemap generation through its App Router conventions. ([Next.js][3])

---

# 64. Public SEO pages

Each active aid point should have an indexable URL:

```text
/ar/aid-points/{slug}
```

Equivalent:

```text
/fr/aid-points/{slug}
/tzm/aid-points/{slug}
```

The page should contain:

* name
* location
* status
* needs
* last verification
* contact
* navigation action

---

# 65. SEO metadata

Every public page should have localized:

* title
* description
* canonical URL
* Open Graph metadata
* social sharing metadata

Next.js identifies title and description metadata as important pieces of page metadata for search and result presentation. ([Next.js][3])

---

# 66. Sitemap

Generate localized public URLs into XML sitemap(s).

Do not expose:

```text
/admin
/organiser
/api
```

through the sitemap.

Next.js supports sitemap generation through the App Router metadata conventions. ([Next.js][4])

---

# 67. Robots

Configure robots so authenticated administrative areas are not crawled.

Next.js specifically recommends using robots directives to exclude private areas such as admin/CMS pages. ([Next.js][5])

---

# 68. Structured data

For public aid-point pages, implement appropriate schema markup where semantically justified.

Do not invent schema types just for SEO.

Structured data should reflect actual visible information.

---

# 69. URL strategy

Recommended:

```text
/ar
/fr
/tzm
```

Public:

```text
/ar/aid-points/[slug]
/fr/aid-points/[slug]
/tzm/aid-points/[slug]
```

Admin:

```text
/admin
/admin/organisers
/admin/aid-points
/admin/reports
/admin/dataset
/admin/audit
/admin/analytics
```

Organiser:

```text
/organiser
/organiser/aid-points
/organiser/analytics
```

The language must not be required for private admin URLs unless there is a clear UX reason.

---

# 70. Recommended architecture

## Architecture type

**Modular monolith**

Not microservices.

```text
Next.js
 ├── Public application
 ├── Organiser dashboard
 ├── Super Admin dashboard
 ├── API
 ├── Auth
 └── Domain/business logic

PostgreSQL + PostGIS
```

This is highly scalable for the expected product and much easier to operate.

---

# 71. Next.js architecture

Use:

> **Next.js 16.2.6**, pinned exactly as specified.

Next.js App Router is the appropriate architecture; current Next.js documentation describes App Router as the routing system using Server Components, Suspense and Server Functions. ([Next.js][6])

Do not upgrade automatically to a later Next.js major/minor merely because npm changes.

When a deliberate upgrade is made, it should go through:

```text
upgrade
→ test
→ security review
→ performance check
→ deployment
```

---

# 72. Folder structure

A senior-level structure should separate:

* routes
* features
* domain
* infrastructure
* shared UI
* API
* auth
* localization
* tests

Recommended:

```text
src/
│
├── app/
│   ├── [locale]/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── aid-points/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   └── search/
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │
│   │   └── layout.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── organisers/
│   │   ├── aid-points/
│   │   ├── reports/
│   │   ├── analytics/
│   │   ├── dataset/
│   │   └── audit/
│   │
│   ├── organiser/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── aid-points/
│   │   └── analytics/
│   │
│   └── api/
│       ├── auth/
│       ├── aid-points/
│       ├── reports/
│       ├── admin/
│       └── organiser/
│
├── features/
│   ├── map/
│   ├── aid-points/
│   ├── needs/
│   ├── reports/
│   ├── search/
│   ├── organisers/
│   ├── analytics/
│   ├── dataset/
│   └── authentication/
│
├── domain/
│   ├── aid-points/
│   ├── organisers/
│   ├── authentication/
│   ├── reports/
│   ├── dataset/
│   └── analytics/
│
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   ├── auth/
│   ├── geo/
│   ├── logging/
│   └── cache/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── map/
│   └── forms/
│
├── store/
│   ├── zustand/
│   └── rtk/
│
├── i18n/
│
├── lib/
│   ├── validation/
│   ├── security/
│   ├── constants/
│   └── utils/
│
├── types/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

Next.js explicitly supports route groups, a `src` directory, and separating route organization from URL structure, making this kind of modular organization compatible with the framework. ([Next.js][7])

---

# 73. Feature architecture rule

A feature should own its business-oriented code.

For example:

```text
features/aid-points/
```

contains:

* UI
* hooks
* schemas
* client-facing types

while:

```text
domain/aid-points/
```

contains business rules.

This avoids turning the project into a giant:

```text
utils/
components/
services/
```

dump.

---

# 74. Prisma architecture

Use Prisma as the standard database abstraction.

Conceptually:

```text
domain
   ↓
repository interface
   ↓
Prisma repository
   ↓
PostgreSQL
```

For PostGIS:

```text
GeoRepository
   ↓
Prisma $queryRaw / $executeRaw
   ↓
PostGIS
```

Use typed/validated SQL and never concatenate raw user input into SQL.

---

# 75. Prisma version requirement

The PRD should state:

> Use the latest Prisma version that is compatible with the selected production toolchain at implementation time, with Prisma versions pinned in the lockfile.

Currently Prisma's official documentation identifies Prisma 8 as current, but current npm metadata shows the Prisma 8 release line in release-candidate/public-beta territory. Therefore production selection should be explicitly validated before implementation rather than blindly choosing an unstable release just because it is tagged `latest`. ([Prisma][8])

---

# 76. RTK Query

All server communication from client-side interactive applications should use:

> **Redux Toolkit Query**

RTK Query is specifically intended for request fetching, caching, loading/error state and cache invalidation. ([redux-toolkit.js.org][9])

Recommended architecture:

```text
RTK Query
   ↓
API layer
   ↓
typed endpoints
   ↓
Next.js backend
```

---

# 77. RTK Query responsibilities

Use RTK Query for:

* nearby aid points
* aid-point details
* reports
* organiser queries
* admin statistics
* organiser statistics
* CRUD mutations
* cache invalidation
* polling where genuinely required

Do not manually create dozens of:

```text
useEffect
fetch
setLoading
setError
```

patterns.

---

# 78. RTK Query cache strategy

Example:

```text
getNearbyAidPoints
getAidPoint
getOrganisers
getAdminStats
getDatasetVersions
```

Use tags:

```text
AidPoint
Organiser
Report
Dataset
Analytics
```

Mutations invalidate only affected resources.

RTK Query's tag-based invalidation model is specifically designed for this pattern. ([redux-toolkit.js.org][10])

---

# 79. Zustand

Use Zustand for **client-only UI state**, not server data.

Good examples:

```text
selected map point
map/list mode
radius selection
map viewport
mobile drawer state
filter drawer state
UI preferences
```

Do not duplicate API data in Zustand.

Architecture:

```text
Server data:
RTK Query

UI/application-local state:
Zustand
```

This separation prevents state duplication.

---

# 80. Map state

Zustand can manage:

```text
map mode
selectedPointId
radius
viewport
isPanelOpen
```

while RTK Query manages:

```text
nearbyPoints
pointDetails
```

---

# 81. API architecture

All APIs should have:

* validation
* authorization
* consistent errors
* request IDs
* localization
* rate limiting
* logging

---

# 82. Error response standard

Example:

```json
{
  "success": false,
  "error": {
    "code": "AID_POINT_NOT_FOUND",
    "message": "نقطة المساعدة غير موجودة."
  },
  "requestId": "req_..."
}
```

Never expose database errors.

Never expose stack traces in production.

---

# 83. API response standard

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Pagination where appropriate:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 143
  }
}
```

---

# 84. Validation

Use one centralized validation strategy across frontend and backend where practical.

Every externally supplied value must be validated server-side.

Examples:

* coordinates
* radius
* URL
* username
* password
* statuses
* IDs
* translations
* pagination
* sort fields

---

# 85. Prevent arbitrary sorting/filter injection

Do not accept:

```text
sortBy=anything
```

and directly map it to SQL.

Use allowlists:

```text
distance
createdAt
updatedAt
status
```

---

# 86. Security architecture

Security requirements include:

### Authentication

JWT access/refresh.

### Authorization

RBAC + ownership checks.

### Password protection

Strong password hashing.

### Sessions

Revocable refresh sessions.

### Input validation

Every endpoint.

### Rate limiting

All sensitive endpoints.

### Security headers

Configured globally.

### CSRF

Appropriate protection for cookie-based authentication.

### CORS

Strictly configured.

### SQL safety

Parameterized queries.

### XSS

Escape/sanitize rendered content.

### Sensitive logging controls

Never log:

* passwords
* refresh tokens
* access tokens
* raw authorization headers

---

# 87. Authorization model

Every protected endpoint performs:

```text
authenticate
     ↓
authorize role
     ↓
authorize resource ownership
     ↓
execute operation
```

Example:

```text
PATCH /organiser/aid-points/123
```

must verify both:

```text
role = ORGANISER
```

and:

```text
point.organiserId = authenticatedUser.id
```

---

# 88. Login security

Implement:

* rate limiting
* failed-login monitoring
* generic error messages
* session revocation
* block enforcement
* reasonable lockout/throttling strategy

Be careful with permanent account lockouts because organisers may need emergency access.

---

# 89. Abuse protection

Protect:

```text
login
refresh
reports
nearby API
search
admin CRUD
organiser CRUD
```

The public geographic endpoint can have a comparatively generous limit but must still be protected against automated abuse.

---

# 90. Database constraints

The database should enforce important invariants wherever possible.

Examples:

```text
username UNIQUE
publicSlug UNIQUE
valid enum/status
valid foreign keys
non-null coordinates
```

Do not rely only on TypeScript.

---

# 91. Aid-point ownership

Schema relationship:

```text
Organiser
    1
    │
    └── N AidPoints
```

An aid point cannot belong to an inactive/nonexistent organiser.

---

# 92. Suggested core database entities

```text
User
Role
RefreshSession

OrganiserProfile

AidPoint
AidPointTranslation

Need
NeedTranslation
AidPointNeed

Category
CategoryTranslation

Report

DatasetVersion
DatasetChange

AuditLog

AnalyticsEvent
```

---

# 93. User model

Conceptually:

```text
User
------
id
username
passwordHash
role
status
createdAt
updatedAt
lastLoginAt
```

Status:

```text
ACTIVE
BLOCKED
```

---

# 94. Refresh session

```text
RefreshSession
--------------
id
userId
tokenHash
familyId
expiresAt
createdAt
revokedAt
replacedById
userAgent
ipAddress
```

Do not store the plaintext refresh token if the chosen implementation supports hashing/token verification appropriately.

---

# 95. Dataset-change model

```text
DatasetChange
-------------
id
datasetVersionId
entityType
entityId
operation
before
after
createdAt
createdBy
```

This makes dataset evolution inspectable.

---

# 96. JSON snapshots

For audit/version records, JSON snapshots can be useful.

But do not use JSON as the primary operational database model for core entities.

Primary data remains normalized relational data.

---

# 97. Analytics event model

Do not store huge raw event payloads forever.

Example:

```text
AnalyticsEvent
--------------
id
eventType
aidPointId
organiserId
createdAt
anonymousSessionId
metadata
```

Avoid collecting exact user GPS unless explicitly required.

---

# 98. Event types

Examples:

```text
PAGE_VIEW
MAP_VIEW
NEARBY_SEARCH
AID_POINT_VIEW
CALL_CLICK
NAVIGATION_CLICK
SHARE
REPORT_SUBMITTED
```

---

# 99. Privacy-conscious analytics

Do not collect unnecessary personal information.

Avoid:

* exact user location history
* unnecessary identifiers
* sensitive device fingerprints

The purpose of analytics is product operations, not surveillance.

---

# 100. Map provider architecture

Use an interactive open map technology such as MapLibre.

The map renderer and data source should remain abstracted.

This means the system can change tile providers later without rewriting the entire map feature.

---

# 101. Google Maps relationship

Google Maps is an outbound action, not the platform's geographic database.

The user can press:

> Open in Google Maps

and be transferred to Google Maps using the verified destination coordinates.

---

# 102. Shared hosting constraint

Your PostgreSQL database lives on shared hosting.

This creates several practical constraints:

* limited CPU
* limited RAM
* limited concurrent connections
* potentially limited network throughput
* unknown PostGIS support
* potentially slow disk I/O

Therefore the application architecture must minimize database pressure.

---

# 103. Critical database requirement

Before development, verify that your shared-hosting PostgreSQL environment supports:

```text
PostGIS
CREATE EXTENSION postgis;
```

If your hosting provider does not allow PostGIS, the proposed geographic architecture cannot be implemented as designed on that database server.

This should be a **technical prerequisite**, not a discovery after development.

---

# 104. Connection management

Because Vercel functions can be invoked concurrently, the application must avoid uncontrolled PostgreSQL connections.

Use:

* connection pooling
* bounded pool size
* database connection monitoring
* short-lived queries
* carefully designed indexes

---

# 105. Database performance strategy

The database should be optimized around the real access patterns.

The hottest query is likely:

> "Give me active points within X km."

Therefore this query deserves first-class optimization.

---

# 106. Geographic index

Create a GiST spatial index over the PostGIS location.

This is essential for scalable radius queries.

---

# 107. Public query optimization

The nearby API should:

* use only necessary columns
* spatially constrain first
* filter active statuses
* calculate distance
* order
* limit results

Never:

```text
SELECT *
```

for the initial map response.

---

# 108. Caching

Cache data that changes infrequently:

* translation dictionaries
* categories
* needs taxonomy
* system configuration

Aid-point operational data should use short-lived or targeted caching because freshness is important.

---

# 109. No Redis initially

Do not add Redis simply because the architecture is "scalable."

Start with:

```text
PostgreSQL
+
Vercel caching/CDN
+
RTK Query client caching
```

Add Redis only when a measurable requirement appears.

---

# 110. No microservices

Do not split into:

```text
auth service
map service
analytics service
aid service
notification service
```

for v1.

The operational overhead is not justified.

The codebase should instead have clear module boundaries so services can later be extracted if necessary.

---

# 111. Testing strategy

Testing is mandatory.

Required:

### Unit tests

Business logic.

### Integration tests

Database/API flows.

### End-to-end tests

Critical user journeys.

---

# 112. Unit-test candidates

Test:

* radius validation
* distance calculations
* status transitions
* freshness classification
* translation fallback rules
* permission logic
* role checks
* ownership rules
* dataset version generation
* audit event generation
* token rotation logic
* report deduplication
* slug generation

---

# 113. Integration tests

Test against a test PostgreSQL/PostGIS database.

Critical flows:

### Authentication

```text
login
refresh
logout
blocked user
invalid credentials
token rotation
token reuse
```

### Aid points

```text
create
edit
publish
archive
status update
ownership
```

### Geography

```text
nearby 10 km
nearby 20 km
nearby 50 km
nearby 100 km
```

### Reports

```text
submit
rate-limit
admin resolution
```

### Versioning

```text
create version
publish
rollback
```

---

# 114. E2E critical journeys

### Public

1. Open Arabic homepage.
2. Allow GPS.
3. Select 20 km.
4. See nearby points.
5. Open point.
6. Call.
7. Open Google Maps.

### Fallback

1. Deny GPS.
2. Search city.
3. See nearby points.

### Organiser

1. Login.
2. Create point.
3. Add needs.
4. Publish/update.
5. Verify.
6. Logout.

### Super Admin

1. Login.
2. Create organiser.
3. Block organiser.
4. Verify organiser access denied.
5. Inspect audit log.
6. Inspect dataset history.

---

# 115. Test coverage philosophy

Do not target a meaningless universal percentage.

Prioritize:

> **100% confidence on critical business/security paths.**

Critical operations should have strong test coverage.

---

# 116. TypeScript requirements

Use strict TypeScript.

Do not permit broad:

```ts
any
```

unless justified.

Public API contracts must be typed.

Database outputs should be mapped into domain types.

---

# 117. Code quality

Require:

* ESLint
* formatting
* strict TS
* import consistency
* no dead code
* no unused variables
* no accidental console logging
* predictable naming

---

# 118. Dependency policy

"Latest package" should not mean:

```text
*
latest
```

in production.

Instead:

```text
explicit version
+
lockfile
+
reviewed upgrades
```

Every package upgrade passes:

```text
install
typecheck
lint
unit tests
integration tests
build
e2e smoke tests
```

---

# 119. Version-control policy

Git.

Branches:

```text
main
develop
feature/*
fix/*
```

or a simpler trunk-based approach.

The PRD should not force a branching ideology; the important requirement is:

> every production change is reviewable and reproducible.

---

# 120. Environment separation

At minimum:

```text
development
test
production
```

Separate:

* database URL
* JWT secrets
* cookie configuration
* map configuration
* analytics configuration

Never commit secrets.

---

# 121. Secret management

Environment variables for:

```text
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
...
```

Do not put secret values in:

* Git
* client bundles
* logs
* source code

---

# 122. Production deployment

Architecture:

```text
Vercel
  ↓
Next.js application
  ↓
secured PostgreSQL server
```

The PostgreSQL server should only expose the minimum necessary network access.

---

# 123. Database migrations

Use Prisma migrations.

Migration process:

```text
development
 ↓
migration generated
 ↓
review
 ↓
test database
 ↓
production deployment
```

Never casually manipulate production schema manually.

---

# 124. Seed data

Provide deterministic seeds for:

* super admin in development/test
* default categories
* default needs
* translation records

Production credentials must not be embedded in seed scripts.

---

# 125. Deployment safety

Before production deployment:

```text
lint
typecheck
unit tests
integration tests
build
migration check
smoke tests
```

---

# 126. Production observability

Monitor:

### Application

* 4xx
* 5xx
* latency
* API errors

### Database

* connections
* slow queries
* locks
* disk usage
* CPU
* memory

### Product

* active points
* stale points
* reports
* organiser activity

---

# 127. Health endpoints

Provide:

```text
/api/health
```

for application health.

Potentially:

```text
/api/health/ready
```

for readiness.

Do not expose sensitive infrastructure information.

---

# 128. Request correlation

Every API request should receive:

```text
requestId
```

Logs, audit records and error reports should reference it.

This makes debugging operational incidents much easier.

---

# 129. Mobile UX requirements

The application must be designed for:

```text
320px+
```

widths and current mobile browsers.

Support:

* Safari iOS
* Chrome Android
* modern desktop Chrome/Edge/Firefox/Safari

---

# 130. Mobile map controls

Avoid tiny desktop-style controls.

Use:

* floating location button
* compact filters
* bottom sheet
* swipe-friendly panels
* large action buttons

---

# 131. Mobile dashboards

The dashboards should not simply be desktop tables squeezed into 375 px.

Tables should become:

```text
cards
+
stacked information
+
action menus
```

where appropriate.

---

# 132. Responsive admin dashboard

Desktop:

```text
sidebar + dashboard
```

Mobile:

```text
top bar
+
drawer
+
stacked cards
```

Same functionality.

---

# 133. Accessibility

Target strong WCAG compliance.

Requirements include:

* keyboard navigation
* screen-reader labels
* semantic HTML
* visible focus
* adequate contrast
* touch targets
* reduced-motion support
* meaningful text alternatives

---

# 134. Map accessibility

Map interfaces are inherently challenging for accessibility.

Therefore the product must provide:

> **List view equivalent**

Users must be able to access aid-point information without relying exclusively on visual map interaction.

---

# 135. Empty states

Never show a blank map without explanation.

Examples:

> No active aid points found within 10 km.

Then:

> Try 20 km.

or:

> Search another location.

---

# 136. GPS errors

Differentiate:

```text
permission denied
timeout
position unavailable
browser unsupported
```

Translate these properly.

Do not simply show:

> GPS error.

---

# 137. Loading UX

Use:

* skeletons
* map loading state
* point-detail loading state
* dashboard skeletons

Never freeze the interface waiting for an API.

---

# 138. Offline/poor connectivity behavior

At minimum:

* cached application shell
* usable error states
* recently loaded information can optionally remain visible with a clear timestamp

Do not present stale information as current.

---

# 139. Public accessibility without JavaScript

The map requires JavaScript, but individual aid-point pages should still provide meaningful server-rendered HTML.

This helps:

* SEO
* slow devices
* search engines
* accessibility

Next.js App Router supports server rendering and client components as appropriate. ([Next.js][6])

---

# 140. Performance targets

Target:

### Public initial render

Under ~2 seconds on a reasonable mobile connection.

### API

P95 target:

< 500 ms under expected normal load.

### Geographic query

P95 target:

< 250–300 ms database/query contribution where infrastructure permits.

### Admin interactions

Generally < 1 second perceived response with appropriate optimistic UI where safe.

These are engineering targets to validate through testing.

---

# 141. Scalability target

The architecture should be designed for:

```text
10,000+ aid points
```

and traffic spikes reaching thousands of concurrent public visitors.

This does not mean the shared PostgreSQL hosting is guaranteed to sustain that load.

The product architecture must instead make the limiting resources identifiable and replaceable.

---

# 142. Scalability boundary

The likely first bottleneck is not the number of records.

It is:

```text
shared PostgreSQL resources
```

Therefore the architecture should make database replacement straightforward.

For example, moving later from:

```text
shared PostgreSQL
```

to:

```text
dedicated managed PostgreSQL
```

should not require application redesign.

---

# 143. No database backups — explicit constraint

Per your current infrastructure constraint:

> Automated backups are **out of scope for v1**.

However, the PRD should mark this as:

### Operational risk: HIGH

because dataset integrity is essential.

The application must therefore at least:

* preserve audit history
* preserve dataset versions
* avoid destructive mutations
* support logical rollback

This does **not** replace actual database backups.

---

# 144. Versioning becomes more important because backups are absent

Since backups are intentionally omitted:

```text
audit logs
+
dataset versions
+
non-destructive lifecycle
+
rollback
```

must be implemented from day one.

But the product documentation must clearly state that version rollback is **not a substitute for database disaster recovery**.

---

# 145. Disaster recovery posture

v1:

> No infrastructure disaster recovery guarantee.

Database loss caused by hosting failure cannot be fully solved by application-level dataset versioning.

That limitation should be explicitly documented.

---

# 146. Data-retention rules

Define retention for:

* audit logs
* reports
* analytics events
* refresh sessions
* archived aid points

Do not retain data indefinitely without purpose.

---

# 147. Aid-point archiving

Do not delete aid points normally.

Use:

```text
ARCHIVED
```

so historical versions remain meaningful.

Hard deletion should be restricted to Super Admin and exceptional cases.

---

# 148. Organiser deletion

Don't immediately cascade-delete all organiser data.

Prefer:

```text
BLOCKED
```

or:

```text
DEACTIVATED
```

This preserves ownership and audit history.

---

# 149. Organiser reassignment

Super Admin should be able to transfer an aid point from one organiser to another.

Action must generate:

```text
OWNER_CHANGED
```

audit entry.

---

# 150. Translation management

Super Admin should have a translation-management interface.

But this is not necessarily a full CMS.

It should manage structured:

* statuses
* categories
* needs
* system messages

while fixed application UI translations remain maintained in code/version control.

"All translated" does not imply "all text must be editable from database."

That distinction is important.

---

# 151. Static vs dynamic content clarification

The product should have:

### Code-managed translations

Application interface:

```text
buttons
menus
errors
labels
```

### Database-managed translated content

Operational information:

```text
aid point names
descriptions
addresses
needs
categories
```

### Generated runtime text

Localized according to backend translation resources.

There should be **no user-visible untranslated content**.

---

# 152. Analytics architecture

Do not let analytics queries destroy operational database performance.

Separate operational and analytical concerns within PostgreSQL first:

```text
operational tables
+
indexed event tables
+
aggregated statistics
```

Potentially move analytics later if scale justifies it.

---

# 153. Pre-aggregated KPIs

For the Super Admin dashboard, don't calculate enormous historical aggregations on every page load.

Maintain daily/hourly aggregates when necessary.

Example:

```text
DailyMetric
-----------
date
metric
value
```

Then dashboard queries remain cheap.

---

# 154. KPI definitions

The PRD should explicitly define every KPI.

Example:

### Aid Point Views

Number of valid detail-page openings.

### Navigation Clicks

Number of clicks on the Google Maps navigation action.

### Contact Clicks

Number of click-to-call actions.

### Verification Coverage

```text
active points verified within threshold
/
active points
```

This prevents analytics ambiguity later.

---

# 155. Public event tracking

Important:

Do not let every map movement become a database event.

That would generate enormous noise.

Track meaningful events such as:

```text
nearby query
point opened
navigation
call
share
report
```

rather than every mouse movement.

---

# 156. SEO + map coexistence

The homepage can remain map-centric while individual pages are SEO-rich.

This gives:

```text
Homepage:
fast operational UX

Aid-point pages:
search-engine discoverability
```

This is the correct compromise.

---

# 157. Search-engine freshness

When an aid point becomes closed, the public page should update its status.

Archived/removed pages should have appropriate:

```text
canonical
noindex
404/410
```

behavior depending on the lifecycle policy.

---

# 158. Security headers

At minimum evaluate:

```text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Frame-ancestors / X-Frame-Options
```

The CSP must be compatible with the selected map and authentication architecture.

---

# 159. Geolocation security

The browser should explicitly request geolocation only after the user chooses:

> Use my location.

This provides clear consent UX.

---

# 160. Admin session security

The admin dashboard should automatically detect:

* expired access token
* invalid refresh token
* blocked account
* revoked session

and redirect to login cleanly.

---

# 161. Never expose authorization decisions to the client alone

For example, hiding:

```text
Delete button
```

is UX.

It is not security.

Backend must reject unauthorized requests even if a malicious user manually constructs them.

---

# 162. Public API security

Public read endpoints must still validate:

* latitude
* longitude
* radius
* pagination
* filters

This prevents deliberately expensive requests.

---

# 163. SQL safety with Prisma

For normal operations:

> Prisma Client.

For PostGIS:

> `$queryRaw` / `$executeRaw` with parameterized values.

Prisma documents this approach for unsupported geographic types. ([Prisma][2])

---

# 164. Frontend/server boundary

Use Server Components for:

* SEO pages
* static-ish content
* server rendering

Use Client Components only where interactivity requires them:

* map
* GPS
* filters
* interactive dashboards
* forms
* RTK Query
* Zustand

This minimizes client JavaScript.

---

# 165. Admin rendering strategy

Dashboards are highly interactive, so client-side components are appropriate for:

* filters
* charts
* tables
* mutations

But shell/layout/SEO-independent content can remain server-rendered.

---

# 166. Public page rendering strategy

Aid-point public pages should be server-rendered for SEO.

Map itself can be a client component.

Conceptually:

```text
Server:
aid point metadata
SEO
structured content

Client:
map interaction
GPS
filters
```

---

# 167. Data fetching strategy

Avoid unnecessarily fetching the same aid-point detail twice.

Use a clear division:

```text
Server:
SEO-critical detail

RTK Query:
interactive map/search/dashboard data
```

---

# 168. UI consistency

Create a reusable design system:

```text
Button
Input
Select
Dialog
Drawer
Badge
Card
Table
Pagination
Skeleton
Toast
EmptyState
```

All multilingual and RTL-aware.

---

# 169. RTL requirements

Arabic interface:

```text
dir="rtl"
```

French:

```text
dir="ltr"
```

Tamazight behavior depends on the chosen script.

The design system must support directional layouts without duplicated components.

---

# 170. Icons

Use icons alongside text for critical actions.

But do not depend solely on icon meaning.

Example:

```text
📍 Open in Google Maps
```

rather than only a map icon.

---

# 171. Color/status accessibility

Do not communicate status only by:

```text
green
orange
red
```

Use:

```text
🟢 Open
🟠 Temporarily unavailable
🔴 Closed
⚠️ Needs verification
```

---

# 172. Organiser creation

Super Admin form:

```text
Username
Password
Confirm password
Display name
Optional organisation name
Status
```

No email verification.

No phone verification.

---

# 173. Password reset

Since no email/phone verification exists:

Super Admin must be able to manually reset an organiser password.

This becomes the administrative recovery mechanism.

---

# 174. Password-reset security

When Super Admin resets a password:

* invalidate all refresh sessions
* record audit event
* require organiser to use the new credential

Optionally support:

> force password change at next login

but this is optional v1.

---

# 175. Organiser activity

Track:

* last login
* last point update
* last verification
* number of points
* recent changes

This helps Super Admin identify inactive organisers.

---

# 176. Super Admin organiser metrics

Example table:

```text
Organizer       Points   Active   Last activity   Status

Org A              12       10      15 min ago      Active
Org B               7        7       2 days ago      Active
Org C              14       0       8 days ago      Blocked
```

---

# 177. Operational alerts

Super Admin should have an alerts area:

```text
12 points need verification
4 organiser accounts blocked
8 unresolved reports
3 duplicate candidates
```

This is more actionable than showing only charts.

---

# 178. No email notifications

Per current scope:

> No email infrastructure is required.

All administrative notifications remain inside dashboards.

---

# 179. No SMS

No SMS.

No OTP.

No phone verification.

---

# 180. Public sharing

Each aid point has:

```text
Share
```

using native browser sharing where available, otherwise copy-link fallback.

---

# 181. Google Maps action

Use coordinates to construct the outbound navigation URL.

Do not depend on a Google Maps API key merely for navigation.

---

# 182. Contact security

Phone numbers shown publicly should be explicitly designated as:

> public operational contact.

Do not accidentally expose private organiser information.

---

# 183. Organiser profile privacy

Public visitors should only see organisational contact information intentionally marked public.

They should not see:

* organiser username
* account metadata
* last login
* internal IDs
* administrative information

---

# 184. Public URLs

Do not expose sequential internal numeric IDs if avoidable.

Use opaque/stable public identifiers or slugs.

---

# 185. Slugs

Localized URLs should ideally remain stable even if translated names change.

A slug can be generated from a canonical public identifier or maintained independently.

Do not break links every time a name changes.

---

# 186. Duplicate aid points

System should detect probable duplicates based on:

```text
name similarity
+
geographic proximity
```

and flag them for Super Admin.

Never auto-delete.

---

# 187. Data integrity

An aid point cannot be published without:

```text
complete required translations
valid coordinates
valid status
organiser
public operational information
```

---

# 188. Publishing workflow

For organiser-created points:

```text
DRAFT
   ↓
SUBMITTED
   ↓
APPROVED
   ↓
ACTIVE
```

Whether approval is mandatory can be configured.

For your initial deployment, I recommend:

> Organiser creates → Super Admin approves.

This adds operational trust.

---

# 189. Organiser edit workflow after approval

Minor operational updates can be immediate:

* status
* needs
* phone
* opening hours

Major changes:

* coordinates
* ownership
* core identity

may require reapproval.

This policy should be configurable.

---

# 190. Publication state vs operational state

Do not conflate them.

Separate:

### Publication

```text
DRAFT
PENDING_REVIEW
PUBLISHED
ARCHIVED
```

### Operational

```text
OPEN
TEMPORARILY_CLOSED
FULL
NEEDS_VERIFICATION
```

This is a significant domain-model improvement.

---

# 191. Example

A point can be:

```text
publicationStatus = PUBLISHED
operationalStatus = TEMPORARILY_CLOSED
```

or:

```text
publicationStatus = PUBLISHED
operationalStatus = NEEDS_VERIFICATION
```

This distinction should exist in the schema.

---

# 192. Admin audit of publication

Every transition is logged.

Example:

```text
Organiser submitted point
Super Admin approved
Organiser changed status to FULL
Super Admin later archived point
```

The full chain remains available.

---

# 193. Dataset version relationship

Only **publicly visible operational state** should be represented in published dataset versions.

Private drafts should not contaminate public dataset versions.

---

# 194. Version publishing

Super Admin can optionally publish a dataset version manually.

Alternatively, the platform can automatically produce logical versions from approved changes.

For v1, I recommend:

> **Automatic version creation per meaningful published change**, with grouping metadata.

This reduces admin workload.

---

# 195. Rollback semantics

Rollback should create a new change set that restores previous values.

Never:

```text
DELETE historical records
```

or mutate old audit history.

---

# 196. Database transaction boundaries

Operations such as:

```text
update aid point
+
create audit log
+
create dataset change
```

should execute transactionally where appropriate.

Either all relevant state is recorded or none is.

---

# 197. Concurrency

Two admins could modify the same point.

Implement optimistic concurrency/version checking.

For example:

```text
version
updatedAt
```

A stale client attempting to overwrite newer data receives:

> Record has changed. Refresh before saving.

This avoids silent data loss.

---

# 198. Organiser concurrency

Same rule applies to:

* needs updates
* translations
* status
* coordinates

---

# 199. Data conflict UI

Example:

> This point was updated by another administrator 2 minutes ago. Your version is outdated.

Actions:

```text
Reload
Compare
```

Comparison UI can be P1.

---

# 200. API pagination

All admin lists use cursor or page pagination.

Never load:

> all organisers

or:

> all reports

in one request.

---

# 201. Search debouncing

Admin and public searches should debounce text queries.

For example:

```text
250–300 ms
```

or another measured value.

Avoid one API request per keystroke.

---

# 202. Map movement requests

Do not query the API for every pixel of map movement.

Debounce/throttle geographic searches.

Better:

* GPS-based search explicitly
* radius change
* significant map movement
* user-triggered search

---

# 203. Map viewport strategy

For the main public UX:

> Radius from user's selected location is the primary query model.

Do not automatically fetch an enormous bounding box while the user freely pans around the country.

This avoids expensive requests.

---

# 204. User location marker

Show approximate current position visually.

Do not send repeated GPS updates to the server.

One positioning request is enough for normal discovery.

---

# 205. Location refresh

Provide:

> Recenter on me

when the user moves.

Again, no persistent tracking.

---

# 206. Product copy

Language should be:

* clear
* calm
* direct
* operational

Avoid:

* dramatic language
* unnecessary marketing
* long paragraphs
* excessive notifications

---

# 207. Public landing content

The homepage should not become a giant content page.

A small informational section can explain:

> Find humanitarian aid collection points near you.

Then immediately:

> Use my location.

---

# 208. SEO content pages

Separate optional SEO pages can explain:

* how the platform works
* how organisers contribute
* what information the map contains

These are not necessary for the core emergency interaction.

---

# 209. Data quality rules

Each aid point should have:

### Required

* name
* location
* operational status
* category
* at least one public contact mechanism
* Arabic/French/Tamazight required public fields
* verification status

---

# 210. Needs priority

Use:

```text
URGENT
HIGH
NORMAL
```

Avoid subjective numeric scores.

---

# 211. Needs expiration

Urgent needs can become irrelevant.

Each need can optionally have:

```text
activeUntil
```

or be manually deactivated.

This prevents:

> "Urgently need water"

remaining forever.

---

# 212. Quantity notes

Optional field:

> We currently need approximately...

This should remain plain informational text.

---

# 213. Opening hours

Support structured weekly hours:

```text
Monday
08:00–18:00
```

plus exceptions:

```text
Special hours:
29 Aug: 10:00–16:00
```

But operational status overrides hours.

---

# 214. Current full state

Useful status:

> Full / temporarily unable to receive additional goods.

This is different from:

> Closed.

---

# 215. Public point sorting

Default ranking:

```text
Active
↓
Distance
↓
Freshness
```

Urgent needs can be highlighted without always overriding proximity.

---

# 216. Search result ranking

Manual place search:

```text
exact match
↓
commune
↓
wilaya
↓
partial match
```

---

# 217. Analytics integrity

Navigation clicks should be measured through the application before redirecting.

But do not delay navigation unnecessarily.

Track event asynchronously where feasible.

---

# 218. No analytics blocking

Analytics must never prevent:

> Open in Google Maps.

Emergency utility always takes precedence.

---

# 219. Accessibility + performance

Avoid heavy chart libraries on every page.

Load analytics/chart modules only in dashboard routes.

Map library should also load only where needed.

---

# 220. Bundle optimization

Use dynamic imports for heavy client libraries:

```text
map
charts
rich editors
```

where practical.

This keeps the homepage lighter.

---

# 221. Error boundaries

Create route-level and dashboard-level error boundaries.

A failure in:

> analytics chart

must not crash:

> entire admin dashboard.

Next.js provides route-level error/loading conventions that support this architecture. ([Next.js][7])

---

# 222. Loading boundaries

Use:

```text
loading.tsx
```

where appropriate for dashboard sections and public routes.

This is especially useful on slower networks.

---

# 223. 404 behavior

Localized public pages should provide translated:

> Aid point not found.

Admin pages should use appropriate private UI.

---

# 224. 500 behavior

Never expose technical details.

Public:

> Something went wrong. Please try again.

Backend:

> detailed structured logs.

---

# 225. Operational incident state

If database is down:

Do not say:

> No aid points found.

Say:

> Aid information is temporarily unavailable.

This distinction is crucial.

---

# 226. Deployment rollback

Application deployments should be reversible through Vercel deployment history.

Database changes should be designed with forward-compatible migrations where possible.

---

# 227. Migration philosophy

Prefer additive migrations:

```text
add field
deploy application supporting both
backfill
remove old field later
```

rather than destructive one-step migrations.

---

# 228. Shared-hosting capacity monitoring

Since the PostgreSQL server is shared hosting, Super Admin application analytics should not pretend to measure infrastructure health that the hosting provider doesn't expose.

Infrastructure monitoring remains a deployment concern.

---

# 229. Product dashboard vs infrastructure monitoring

Super Admin sees:

> business/product KPIs.

Developer/operator sees:

> server/database health.

Do not mix them unnecessarily.

---

# 230. Admin dashboard information architecture

```text
Overview
Aid points
Organisers
Reports
Dataset
Analytics
Audit log
Settings
```

---

# 231. Organiser dashboard information architecture

```text
Overview
My aid points
Needs
Activity
Profile
```

---

# 232. Profile

Organiser can view:

* username
* display name
* account status

They should not necessarily be able to change username.

---

# 233. Username changes

Recommend:

> Super Admin only.

This prevents operational identity confusion.

---

# 234. Admin account management

Super Admin should be able to:

* create organiser
* block
* unblock
* reset password
* deactivate
* view activity

---

# 235. Super Admin count

The system should support multiple Super Admin accounts eventually.

Do not hard-code exactly one.

---

# 236. High-risk Super Admin operations

Require confirmation for:

* block organiser
* archive aid point
* rollback dataset
* ownership transfer

---

# 237. Destructive operation philosophy

Prefer:

```text
archive
deactivate
block
```

over:

```text
delete
```

---

# 238. Public source-of-truth label

Each aid point should say:

> Information managed by [organisation / platform]

where appropriate.

Don't imply governmental authority unless officially established.

---

# 239. Verification badge

A useful concept:

```text
Verified
```

meaning the operational information was recently confirmed.

This is not a legal certification.

The exact wording should be chosen carefully.

---

# 240. Verification action

Organiser clicks:

> Verify information

System records:

```text
verifiedAt = now
verifiedBy = organiser
```

This is one of the most important operational actions.

---

# 241. Verification history

Super Admin can inspect:

```text
29 Aug 09:30 — Organiser X
28 Aug 21:10 — Super Admin
```

---

# 242. Data source transparency

Every public point could eventually include:

> Last updated by [organisation]

but avoid exposing private usernames.

---

# 243. Public confidence UX

Use:

```text
Verified recently
Last updated 2 hours ago
```

rather than meaningless:

> Trusted.

---

# 244. Product KPI hierarchy

### North-star KPI

**Successful aid-point interactions**

A detail view followed by:

```text
Call
Navigation
Share
```

### Secondary KPIs

* active verified points
* search success
* median time to useful action
* report resolution time
* information freshness
* geographic coverage

---

# 245. "Time to useful action"

A particularly strong metric:

> Time from homepage opening to first useful aid-point action.

Goal:

> reduce friction.

This should be measured anonymously and carefully.

---

# 246. Search success rate

Possible:

```text
nearby searches that return at least one relevant point
/
nearby searches
```

Useful for identifying coverage gaps.

---

# 247. Empty-search rate

If:

> 60% of searches in a region return nothing,

that's product intelligence.

It can help Super Admin identify areas needing more organisers.

---

# 248. Verification coverage KPI

```text
active points verified within freshness window
÷
active points
```

This should be prominently displayed.

---

# 249. Report resolution KPI

Track:

```text
average time to resolution
```

and:

```text
open reports
```

---

# 250. Organiser effectiveness KPI

Potentially:

```text
points maintained
verification freshness
reports per point
public interactions per point
```

Do not use these to punish organisers blindly; context matters.

---

# 251. Recommended launch phases

## Phase 0 — Technical validation

Before UI implementation:

1. Confirm shared-host PostgreSQL supports PostGIS.
2. Confirm network access from Vercel to database.
3. Confirm connection limits.
4. Confirm Prisma/PostGIS integration.
5. Confirm map-tile provider.
6. Confirm domain/HTTPS.

This phase prevents major architectural surprises.

---

# 252. Phase 1 — Core platform

Build:

* PostgreSQL/PostGIS
* Prisma
* authentication
* JWT
* role system
* organiser management
* aid points
* translations
* map
* GPS
* radius
* navigation

---

# 253. Phase 2 — Operational quality

Build:

* verification
* stale-state rules
* reports
* dataset versioning
* audit logs
* publication workflow
* duplicate detection

---

# 254. Phase 3 — Analytics

Build:

* Super Admin KPIs
* organiser KPIs
* event tracking
* geographic analytics
* time-series dashboards

---

# 255. Phase 4 — SEO/performance hardening

Build:

* public SEO pages
* metadata
* sitemap
* robots
* structured data
* caching
* bundle optimization
* performance tests

---

# 256. Phase 5 — Security and release hardening

Perform:

* penetration-oriented testing
* authorization tests
* JWT tests
* rate-limit tests
* SQL injection tests
* XSS tests
* CSRF tests
* session-revocation tests
* load tests

---

# 257. Definition of Done

A feature is not done when:

> "It works on my laptop."

It is done when:

```text
functional
+
localized
+
responsive
+
validated
+
authorized
+
tested
+
observable
+
documented
```

---

# 258. MVP release criteria

The production launch should be blocked if any of these fail:

### Critical

* PostGIS unavailable
* GPS flow broken
* radius queries incorrect
* organiser can access another organiser's data
* blocked organiser can still access dashboard
* refresh-token revocation fails
* unauthorized API mutation possible
* multilingual content missing
* public aid-point navigation wrong
* audit logs missing
* dataset version corrupted

---

# 259. Security release criteria

No known critical/high vulnerability in:

* authentication
* authorization
* session handling
* SQL
* XSS
* CSRF
* sensitive data exposure

---

# 260. Data correctness release criteria

Test:

```text
known coordinate
→ expected point
```

across:

* 10 km
* 20 km
* 50 km
* 100 km

including boundary cases.

---

# 261. Geographic accuracy

Distance must be calculated server-side with a proper geographic coordinate system.

Do not use a simplistic:

```text
abs(lat1-lat2)
```

distance approximation for production filtering.

---

# 262. Dataset version acceptance

Given:

```text
Version 5
```

and a sequence of changes:

```text
A create
B update
C close
```

the system must reconstruct the correct state.

Rollback must generate:

```text
Version 6
```

rather than corrupting Version 5.

---

# 263. Authentication acceptance

Test:

```text
valid login
invalid login
blocked account
expired access
valid refresh
expired refresh
revoked refresh
refresh reuse
logout
password reset
```

---

# 264. Organiser authorization acceptance

Test that organiser A cannot:

```text
read point B
update point B
archive point B
change point B
```

even if they manipulate HTTP requests directly.

---

# 265. Super Admin acceptance

Super Admin can:

```text
create organiser
block
unblock
reset password
manage all points
view all analytics
view audits
manage versions
```

---

# 266. Responsive acceptance

Test at least:

```text
320px
375px
390px
768px
1024px
1280px+
```

---

# 267. RTL acceptance

Test every critical screen in:

```text
Arabic
```

and verify:

* direction
* alignment
* menus
* dialogs
* tables
* forms
* map detail sheet
* charts
* pagination

---

# 268. Translation acceptance

Automated check should fail the build if required translation keys are missing.

For database content:

publication should fail when required locale content is absent.

---

# 269. "No static content" enforcement

This can be partially enforced through:

* translation linting
* code review
* i18n key conventions
* grep/static analysis
* typed translation keys

The goal is to make accidental hard-coded UI text difficult.

---

# 270. Recommended package philosophy

Core stack:

```text
Next.js 16.2.6
React version compatible with Next.js 16.2.6
TypeScript
Prisma
PostgreSQL
PostGIS
Redux Toolkit
RTK Query
Zustand
Tailwind CSS
Zod
MapLibre
```

Plus only packages justified by a concrete requirement.

Avoid dependency bloat.

---

# 271. RTK Query vs Zustand final rule

This needs to be explicit in the engineering specification:

> **RTK Query = remote/server state.**

> **Zustand = local/client state.**

No duplication unless there is a documented reason.

---

# 272. Prisma vs raw SQL final rule

> Prisma for relational application data.

> Raw parameterized SQL for PostGIS-specific operations.

This is the cleanest way to honor your Prisma requirement without fighting the database.

---

# 273. Next.js folder-structure philosophy

Use route groups to separate:

```text
public
auth
admin
organiser
```

without making URLs unnecessarily complicated.

Next.js documents route groups specifically as a mechanism for organizing routes without affecting the URL path. ([Next.js][7])

---

# 274. Architecture evolution path

### v1

```text
Vercel
+
PostgreSQL/PostGIS
```

### Scale-up

```text
Vercel
+
dedicated PostgreSQL
+
connection pooling
+
cache
```

### Larger scale

Potentially:

```text
Vercel
+
API service
+
PostGIS
+
analytics store
```

The domain boundaries should make that evolution possible without rewriting the frontend.

---

# 275. What should remain deliberately simple

Do not build:

```text
native mobile app
chat
social features
payments
volunteer marketplace
real-time user tracking
complex notification infrastructure
AI recommendations
microservices
```

until usage proves they are needed.

---

# 276. Final system architecture

```text
                         ┌──────────────────┐
                         │   PUBLIC USERS   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     VERCEL       │
                         │                  │
                         │ Next.js 16.2.6   │
                         │ App Router       │
                         │ TypeScript       │
                         │ Public UI        │
                         │ Admin UI         │
                         │ Organiser UI     │
                         │ API              │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼──────────────────┐
              │                   │                  │
              ▼                   ▼                  ▼
           RTK Query          Zustand             Auth
       server state          UI state          JWT/session
              │
              ▼
       ┌──────────────────────┐
       │ Domain / Services     │
       │                      │
       │ Aid Points           │
       │ Organisers           │
       │ Reports              │
       │ Dataset Versions     │
       │ Analytics            │
       └──────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   Prisma ORM         Geo Repository
        │                   │
        │              parameterized SQL
        │                   │
        └─────────┬─────────┘
                  ▼
       ┌──────────────────────┐
       │ PostgreSQL + PostGIS │
       │                      │
       │ operational data     │
       │ dataset versions     │
       │ audit logs           │
       │ analytics            │
       └──────────────────────┘

                  │
                  ▼
            MapLibre
                  │
                  ▼
            Map tile provider

Aid Point
   │
   └──────────────► Google Maps navigation
```

# 277. Final technology specification

| Layer               | Decision                                             |
| ------------------- | ---------------------------------------------------- |
| Framework           | **Next.js 16.2.6**                                   |
| Rendering           | App Router + Server/Client Components                |
| Language            | TypeScript strict                                    |
| ORM                 | Prisma                                               |
| Database            | PostgreSQL                                           |
| Geographic DB       | PostGIS                                              |
| Geographic queries  | Parameterized raw SQL through Prisma                 |
| Server-state/API    | Redux Toolkit Query                                  |
| Client/UI state     | Zustand                                              |
| Map                 | MapLibre                                             |
| Authentication      | JWT access + refresh                                 |
| Refresh management  | Rotating/revocable server-side sessions              |
| Public auth         | None                                                 |
| Organiser auth      | Username/password                                    |
| Super Admin auth    | Username/password                                    |
| Email verification  | None                                                 |
| Phone verification  | None                                                 |
| Public registration | None                                                 |
| Styling             | Tailwind CSS                                         |
| Validation          | Zod                                                  |
| Tests               | Unit + integration + E2E                             |
| Hosting             | Vercel                                               |
| DB hosting          | Existing shared PostgreSQL hosting                   |
| Languages           | Arabic default, French, Tamazight                    |
| SEO                 | Metadata + sitemap + robots + localized public pages |
| Dataset history     | Versioned + auditable                                |
| Backups             | Explicitly out of scope for v1                       |
| Architecture        | Modular monolith                                     |
| Public GPS storage  | None                                                 |

RTK Query is particularly appropriate here because its intended role is server-data fetching/caching/invalidation, while Zustand can remain dedicated to local interface state. ([redux-toolkit.js.org][9])

# 278. The most important architectural decisions

There are five decisions in this PRD that I would consider **non-negotiable**:

**1. PostgreSQL + PostGIS is the geographic source of truth.**
Google Maps is only an outbound navigation tool.

**2. JWT access/refresh tokens are revocable, not blindly trusted forever.**
Blocking an organiser must immediately terminate their ability to refresh sessions.

**3. Publication state and operational state are separate.**
A point can be published but temporarily closed or awaiting verification.

**4. Dataset versioning + audit logging are first-class database concepts.**
This matters especially because you've chosen not to have database backups for v1.

**5. RTK Query and Zustand have strictly separate responsibilities.**
RTK Query owns server state; Zustand owns client/UI state.

The architecture also deliberately avoids overengineering: **one Next.js modular monolith + PostgreSQL/PostGIS** is enough for the initial product, while the boundaries are clean enough to evolve later. Next.js itself supports the route-group and modular organization needed for this structure. ([Next.js][7])

And one infrastructure issue should be resolved **before writing the application**: confirm that your shared PostgreSQL host actually allows **PostGIS** and permits secure external connections from Vercel. Without PostGIS, the geographic part of this exact design needs to change.

[1]: https://www.npmjs.com/package/next?activeTab=versions "next - npm"
[2]: https://www.prisma.io/docs/orm/v7/prisma-client/using-raw-sql/safeql "Integrate SafeQL with Prisma Client | Prisma Documentation"
[3]: https://nextjs.org/learn/seo/metadata "SEO: Metadata | Next.js"
[4]: https://nextjs.org/learn/seo/xml-sitemaps "SEO: XML Sitemaps | Next.js"
[5]: https://nextjs.org/learn/seo/metatags "SEO: Special Meta Tags for Search Engines | Next.js"
[6]: https://nextjs.org/docs/app "Next.js Docs: App Router | Next.js"
[7]: https://nextjs.org/docs/app/getting-started/project-structure "Getting Started: Project Structure | Next.js"
[8]: https://www.prisma.io/docs/prisma-orm/quickstart/postgresql "Quickstart: Prisma 8 with PostgreSQL | Prisma Documentation"
[9]: https://redux-toolkit.js.org/tutorials/rtk-query "RTK Query | Redux Toolkit"
[10]: https://redux-toolkit.js.org/rtk-query/usage/queries "Queries | Redux Toolkit"
