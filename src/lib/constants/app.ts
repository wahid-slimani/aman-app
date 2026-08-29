export const ACCESS_COOKIE_NAME = "aman_access";
export const REFRESH_COOKIE_NAME = "aman_refresh";
export const CSRF_COOKIE_NAME = "aman_csrf";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const ALLOWED_RADIUS_KM = [10, 20, 50, 100] as const;
export const MAX_NEARBY_RESULTS = 200;

export const RETENTION_DAYS = {
	refreshSessions: 30,
	analyticsEvents: 180,
	auditLogs: 365
} as const;
