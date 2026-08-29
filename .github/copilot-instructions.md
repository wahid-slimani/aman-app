# Global Copilot Execution Instructions

## 1) Authority and requirement integrity

- The PRD in `prd.md` is the single source of truth.
- Do not modify PRD requirements.
- Do not add conflicting functionality.
- Do not skip minor requirements.
- If ambiguity exists, preserve PRD intent and document assumptions without changing scope.

## 2) Strict sequential phase execution

- Work only on the phase declared in `.github/phases/active-phase.md`.
- Do not start any requirement assigned to a future phase.
- Do not leave current-phase requirements for later.
- Phase transitions require passing the phase gate checklist and DoD.

## 3) Architecture lock

Must remain aligned with PRD:
- Next.js 16.2.6 (pinned)
- App Router
- TypeScript strict mode
- PostgreSQL + PostGIS
- Prisma for relational operations
- Parameterized raw SQL for PostGIS-specific queries
- RTK Query for server state
- Zustand for UI-local state
- MapLibre map stack
- Modular monolith (no microservices in v1)

## 4) Role and security lock

- Public: no registration required, read + report only.
- Organiser: own resources only.
- Super Admin: global management.
- Username/password auth only for admin roles in v1.
- Access token short TTL, refresh token rotation + revocation.
- Blocking organiser invalidates active sessions.
- Backend authorization is mandatory for every protected route.

## 5) i18n lock

- No user-visible hard-coded strings.
- Arabic default language.
- Supported locales: ar-DZ, fr-DZ, tzm-DZ.
- Backend messages localized with stable machine-readable error codes.
- Required multilingual content completeness enforced before publication.

## 6) UX quality lock

- Map-first public experience.
- Mobile-first and responsive at 320px+.
- Non-generic, high-quality UI with strong hierarchy and polished states.
- Required states on every feature: loading, empty, error, success, disabled, validation.
- Accessibility and RTL compliance are mandatory, not optional.

## 6.1) Mandatory UI/UX skill usage lock

- For all UI/UX implementation and redesign work, Copilot must apply `ui-ux-pro-max` and `gpt-taste` skill guidance.
- If `gpt-taste` is not applicable for a specific screen type, fallback to `design-taste-frontend` while preserving PRD constraints.
- UI work cannot pass phase gate without explicit skill-usage evidence in phase verification artifacts.

## 7) Testing and release lock

- Unit, integration, and E2E coverage for critical flows.
- Security, authorization, and token lifecycle tests are release blockers.
- MVP critical blockers from PRD must all pass.
- No phase completion without verification evidence.

## 8) Change safety

- Prefer incremental, non-destructive changes.
- Preserve existing behavior unless current-phase requirement explicitly changes it.
- Use additive migrations where possible.
- Keep deployment rollback and forward compatibility in mind.

## 9) Required read order each session

1. `prd.md`
2. `.github/README.md`
3. `.github/copilot-instructions.md`
4. `.github/phases/active-phase.md`
5. Current phase file in `.github/phases/`
6. Relevant rule files in `architecture/`, `engineering/`, `verification/`

## 10) Completion discipline

A phase is complete only when:
- all assigned requirements are implemented,
- all required checks pass,
- no major regressions exist,
- responsive + accessibility + security checks pass,
- phase DoD and gate criteria are met.

## 11) Task-level traceability discipline

- Every implementation task must be tracked in the active phase task tracker.
- No task may be silently deferred if it belongs to the active phase scope.
- Each completed task must reference PRD item numbers and verification evidence.
- Phase transition is blocked if any active-phase task remains open without approved blocker status.
