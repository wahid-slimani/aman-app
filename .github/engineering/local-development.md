# Local Development Configuration

## Development database

Use the local PostgreSQL database you created for development.

Local database value provided by project owner:
- Database name: aman

Credentials (username/password) must be configured locally and must not be committed.

## Secret handling rule

- Do not commit credentials into repository files.
- Store credentials only in local untracked environment files.
- Never print credentials in logs, screenshots, or committed documentation.

## Required local environment variables

Set locally (example names):
- DATABASE_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- NEXT_PUBLIC_MAPTILER_KEY

Example local-only DATABASE_URL format:
- postgresql://<username>:<password>@localhost:5432/aman

For your local machine, set `<username>` and `<password>` to your own local values.

## Git safety

- `.env*` must remain ignored by Git.
- If a secret was ever committed, rotate it and remove it from Git history as a follow-up security action.

## Prisma and PostGIS reminder

- Use Prisma for relational operations.
- Use parameterized raw SQL through Prisma for PostGIS-specific operations.
- Validate PostGIS extension support before Phase 01 implementation.

## Development seed helper

- A development-only helper endpoint exists at `/api/auth/dev-seed`.
- It creates baseline local users for testing auth flows and is blocked in production.
