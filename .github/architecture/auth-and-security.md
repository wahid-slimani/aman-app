# Authentication And Security Rules

## Authentication model

- Username/password only (v1).
- No email verification, OTP, phone verification, social login, or magic links.

## Token architecture

Access token:
- short-lived JWT
- minimal claims: sub, role, sessionId, iat, exp

Refresh token:
- long-lived
- tied to server-side refresh session record
- rotation on refresh
- revocable
- reuse detection invalidates token family/session

## Token storage model

- Access token: in-memory client state preferred.
- Refresh token: secure HttpOnly cookie (`Secure`, `HttpOnly`, `SameSite`).
- Avoid long-lived auth material in localStorage.

## Session lifecycle enforcement

- Blocked organiser cannot continue authenticated usage.
- Password reset invalidates active refresh sessions.
- Logout revokes refresh session and clears refresh cookie.

## Authorization model

- RBAC + ownership checks on protected operations.
- Backend enforcement mandatory regardless of UI controls.

## Security controls baseline

- Endpoint validation everywhere.
- Rate limiting for auth/report/nearby/search/admin/organiser paths.
- CSRF protections for cookie-based flows.
- Strict CORS policy.
- Security headers policy (CSP/HSTS/etc.).
- XSS protections and safe rendering.
- SQL parameterization always.

## Security logging restrictions

Must never log:
- passwords
- access tokens
- refresh tokens
- raw authorization headers

## Release security posture

- No known critical/high vulnerabilities in auth, authorization, session handling, SQL, XSS, CSRF, or sensitive exposure at release gate.
