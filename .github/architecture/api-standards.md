# API Standards

## Endpoint families

- Public: map discovery, detail view, search, report submission.
- Auth: login, refresh, logout.
- Organiser: own dashboard and own aid-point management.
- Admin: organiser management, global aid points, reports, dataset, analytics, audit.

## Contract standards

- Stable envelope for success/errors.
- Stable error codes and localized messages.
- Request ID in every response.
- Pagination required for admin lists.

## Query guardrails

- Radius allowlist only: 10/20/50/100 km.
- Sort/filter allowlists only.
- Result caps on nearby responses.
- Debounced/throttled triggering patterns in clients.

## Performance-aware payload strategy

- Map summary endpoint returns compact fields only.
- Detail endpoint returns full aid-point details.

## Security requirements

- Protected endpoints enforce auth + role + ownership.
- Public endpoints still validate all user input.
- Rate limiting and abuse controls for sensitive/public endpoints.

## Error semantics

- Incident messaging must distinguish true empty results from system unavailability.
- Avoid technical leakage in user-facing messages.
