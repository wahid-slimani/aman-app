import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { refreshSession } from "@/domain/authentication/service";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS
} from "@/lib/constants/app";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return apiError({ code: "AUTH_REFRESH_MISSING", messageKey: "auth.refreshMissing", status: 401 }, locale);
  }

  const result = await refreshSession(refreshToken).catch(() => ({ ok: false as const, reason: "AUTH_REFRESH_INVALID" as const }));

  if (!result.ok) {
    return apiError({ code: result.reason, messageKey: "auth.refreshInvalid", status: 401 }, locale);
  }

  const response = apiSuccess({ refreshed: true });

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

  return response;
}
