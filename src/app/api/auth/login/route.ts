import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { isRateLimited } from "@/lib/api/rate-limit";
import { login } from "@/domain/authentication/service";
import {
  ACCESS_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS
} from "@/lib/constants/app";
import { trackAnalyticsEvent } from "@/domain/analytics/service";
import { AnalyticsEventType } from "@prisma/client";
import { createCsrfToken } from "@/lib/security/policy";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`login:${ip}`, 10, 60_000)) {
    return apiError({ code: "AUTH_RATE_LIMITED", messageKey: "auth.rateLimited", status: 429 }, locale);
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const result = await login({
    username: parsed.data.username,
    password: parsed.data.password,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress: ip
  });

  if (!result.ok) {
    const messageKey = result.reason === "AUTH_ACCOUNT_BLOCKED" ? "auth.accountBlocked" : "auth.invalidCredentials";
    return apiError({ code: result.reason, messageKey, status: 401 }, locale);
  }

  await trackAnalyticsEvent({
    type: AnalyticsEventType.AUTH_LOGIN_SUCCESS,
    source: "api",
    locale,
    userRole: result.user.role,
    userId: result.user.id
  });

  const response = apiSuccess({ user: result.user });
  const csrfToken = createCsrfToken();

  response.cookies.set(ACCESS_COOKIE_NAME, result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: "/"
  });

  response.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
    path: "/api/auth"
  });

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: "/"
  });

  return response;
}
