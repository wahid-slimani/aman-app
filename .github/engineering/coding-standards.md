# Coding Standards

## Language and typing

- TypeScript strict mode is mandatory.
- Avoid broad `any` unless explicitly justified and documented.
- Public API contracts must be strongly typed.
- Map DB outputs into domain types.

## Code quality

- ESLint and formatter required.
- No dead code or unused variables.
- Import consistency required.
- No accidental production console logging.
- Predictable naming conventions.

## Validation and safety

- Centralized validation strategy (frontend/backend reuse where practical).
- Validate all externally supplied values server-side.
- Avoid arbitrary sort/filter field mapping; use allowlists.

## Dependency policy

- Explicit versions and lockfile pinning.
- No wildcard or floating production versions.
- Upgrades require full quality pipeline checks.

## Migration safety

- Prefer additive migrations and forward compatibility.
- Review migrations before production application.
