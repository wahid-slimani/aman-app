# Roles And Permissions

Source: `prd.md`.

## Public user

Allowed:
- View active aid points.
- Search by place without GPS.
- Use GPS (optional).
- Filter by allowed radius and categories.
- Open aid-point details.
- Trigger call action.
- Open Google Maps navigation.
- Share aid-point link.
- Submit report.

Denied:
- Authentication-required dashboards.
- Any write operation except report submission.

## Organiser

Allowed:
- Login/logout.
- Access `/organiser` area.
- Manage own aid points only.
- Create and edit own records.
- Update status/needs/contact/opening hours.
- Verify information freshness.
- View own analytics/statistics.

Denied:
- Global organiser administration.
- Super Admin management.
- Global platform analytics not assigned to organiser scope.
- System settings administration.
- Access to records owned by other organisers.

Enforcement:
- Backend must validate role + ownership on every protected organiser operation.

## Super Admin

Allowed:
- Full management of organisers and aid points.
- Create organiser account.
- Block/unblock/deactivate organiser.
- Reset organiser credentials.
- Approve/reject publication.
- Manage categories/needs/translations/system configuration.
- View KPIs, audit logs, dataset versions.
- Perform eligible rollback and ownership transfer.

High-risk actions requiring explicit confirmation:
- Block organiser.
- Archive aid point.
- Roll back dataset.
- Transfer ownership.

## Role model constraints

- Current required roles: `SUPER_ADMIN`, `ORGANISER`.
- Architecture should remain extensible for future roles without implementing them in v1.
- Support multiple Super Admin accounts (do not hard-code one).
