import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { isRateLimited } from "@/lib/api/rate-limit";
import { createUserForDev, login } from "@/domain/authentication/service";
import {
  ACCESS_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS
} from "@/lib/constants/app";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";
import { trackAnalyticsEvent } from "@/domain/analytics/service";
import { AnalyticsEventType } from "@prisma/client";
import { createCsrfToken } from "@/lib/security/policy";

const DEV_ACCOUNTS: Record<
  string,
  { password: string; role: "SUPER_ADMIN" | "ORGANISER"; displayName?: string }
> = {
  "wahid-slimani": {
    password: "12!?waHid21!?",
    role: "SUPER_ADMIN"
  },
  "organiser": {
    password: "organiser123",
    role: "ORGANISER",
    displayName: "Default Organiser"
  },
  "organiser-wahid": {
    password: "12!?orgaNiser21!?",
    role: "ORGANISER",
    displayName: "Wahid Slimani Organiser"
  }
};

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

  let result = await login({
    username: parsed.data.username,
    password: parsed.data.password,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress: ip
  });

  if (!result.ok && process.env.NODE_ENV !== "production") {
    const key = parsed.data.username.trim().toLowerCase();
    const account = DEV_ACCOUNTS[key];

    if (account && account.password === parsed.data.password) {
      await createUserForDev({
        username: parsed.data.username,
        password: parsed.data.password,
        role: account.role,
        displayName: account.displayName
      });

      result = await login({
        username: parsed.data.username,
        password: parsed.data.password,
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipAddress: ip
      });
    }
  }

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

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/"
  });

  return response;
}
