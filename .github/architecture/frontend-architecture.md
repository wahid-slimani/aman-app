# Frontend Architecture Rules

## Public application

- Homepage is map-first and action-first.
- GPS is optional and user-consent initiated.
- Non-GPS fallback search is mandatory.
- Marker clustering is mandatory.
- Map + list equivalent is mandatory for accessibility.

## State responsibilities

- RTK Query: server data and API cache/invalidation.
- Zustand: local UI state only.
- No duplicated server data in Zustand unless explicitly justified.

## UI state obligations

Every feature must define:
- loading state
- empty state
- error state
- success feedback
- disabled state
- validation feedback

## Responsiveness

- Mobile-first.
- Minimum supported width: 320px.
- Test breakpoints: 320, 375, 390, 768, 1024, 1280+.

## Accessibility

- Keyboard support and visible focus.
- Screen reader labels and semantic HTML.
- Adequate contrast and touch targets.
- Reduced-motion considerations.

## RTL and locale direction

- Arabic routes must render RTL.
- French routes must render LTR.
- Tamazight direction behavior follows selected script strategy.

## Dashboard behavior

- Desktop: richer table + analytics layouts.
- Mobile: card-based, stacked information, action menus.
- Preserve functional parity across form factors.
