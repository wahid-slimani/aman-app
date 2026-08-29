# UI And UX System Rules

## Quality bar

- UI must be professional, intentional, and non-generic.
- Public map interaction speed and clarity take precedence over decorative complexity.
- Admin and organiser dashboards must prioritize operational clarity.

## Required UI/UX skills policy

- Primary skills for UI work: `ui-ux-pro-max` and `gpt-taste`.
- If `gpt-taste` is not appropriate for a specific task, use `design-taste-frontend` as fallback.
- Skill usage must not override PRD requirements; PRD remains authoritative.
- Each UI phase verification must include skill-usage evidence.

## Design system requirements

Reusable components must include:
- Button
- Input
- Select
- Dialog
- Drawer
- Badge
- Card
- Table
- Pagination
- Skeleton
- Toast
- EmptyState

Requirements:
- multilingual support
- RTL/LTR compatibility
- consistent interaction and feedback states

## Public UX

- Map occupies primary viewport area.
- Near-me action is prominent.
- Mobile bottom sheet for selected point details.
- Quick actions: call, open navigation, share, report.
- Empty results must provide guidance.

## Dashboard UX

- Super Admin IA: overview, aid points, organisers, reports, dataset, analytics, audit, settings.
- Organiser IA: overview, my aid points, needs, activity, profile.
- Mobile dashboards convert dense tables into cards/stacks/action menus.

## Accessibility obligations

- Do not encode status with color only.
- Provide text/icon combinations and semantic labels.
- Preserve keyboard/screen-reader usability.

## Copy principles

- Clear, calm, direct, operational tone.
- Avoid dramatic marketing language and long blocks of text.

## Mandatory UX states per feature

- loading
- empty
- error
- success
- disabled
- validation
