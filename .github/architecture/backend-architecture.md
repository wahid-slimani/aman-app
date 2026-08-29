# Backend Architecture Rules

## API behavior

All endpoints must provide:
- validation
- authorization (when protected)
- stable response envelope
- localized messages
- request ID correlation
- logging and rate limiting

## Response contracts

Success shape:
- `success: true`
- `data`
- optional `meta`

Error shape:
- `success: false`
- `error.code` stable
- `error.message` localized
- `requestId`

## Authorization chain

Protected endpoints must execute:
1. authenticate
2. authorize role
3. authorize ownership/resource scope
4. execute domain logic

## Public endpoint discipline

- Validate coordinates, radius, filters, and pagination.
- Apply bounded result limits.
- Protect against expensive abuse patterns.

## Security controls

- Never expose stack traces or raw DB errors.
- Never log passwords/tokens/raw auth headers.
- Enforce session revocation on block/logout/password reset flows.

## Domain operations requiring transactional behavior

Where required, ensure atomic operation sets for:
- aid-point update
- audit record creation
- dataset change creation
