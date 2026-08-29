# System Architecture Rules

Source authority: `prd.md`.

## Architecture type

- Modular monolith.
- No microservices for v1.

## Required stack

- Next.js 16.2.6 (pinned).
- App Router.
- TypeScript strict mode.
- PostgreSQL + PostGIS.
- Prisma ORM + parameterized raw SQL for PostGIS-specific operations.
- RTK Query for remote/server state.
- Zustand for client/UI-local state.
- Tailwind CSS.
- Zod validation.
- MapLibre for map rendering.

## Domain boundaries

- Public app.
- Auth.
- Organiser app.
- Super Admin app.
- API layer.
- Domain/business services.
- Infrastructure and repository layer.

## Route and app boundaries

- Public localized routes under `/[locale]`.
- Private routes under `/admin` and `/organiser`.
- Do not rely on hidden navigation for authorization.

## Rendering boundaries

- Server Components for SEO/static-like and metadata-rich pages.
- Client Components for map, GPS, filters, forms, dashboards, RTK Query, Zustand.
- Avoid duplicate fetches between server-rendered detail and client interaction.

## Evolution path

- v1 on Vercel + shared PostgreSQL/PostGIS.
- Keep boundaries clean for future dedicated DB / service extraction if needed.
- Do not pre-build distributed architecture that PRD excludes.
