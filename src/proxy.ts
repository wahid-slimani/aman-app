import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { ACCESS_COOKIE_NAME } from "@/lib/constants/app";
import { applySecurityHeaders, getCorsHeaders, hasValidCsrf, isOriginAllowed, shouldCheckCsrf } from "@/lib/security/policy";
import { resolveLocale } from "@/lib/api/locale";
import { t } from "@/lib/api/messages";

function decodeJwtPayload(token: string): { role?: string } | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    const payload = JSON.parse(decoded) as { role?: string };
    return payload;
  } catch {
    return null;
  }
}

const LOCALE_PREFIX_EXCLUSION = ["/api", "/admin", "/organiser", "/_next", "/favicon.ico"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const locale = resolveLocale(request.headers.get("accept-language"));

  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    if (!isOriginAllowed(origin)) {
      const response = NextResponse.json(
        { success: false, error: { code: "CORS_FORBIDDEN", message: t(locale, "common.corsForbidden") } },
        { status: 403 }
      );
      applySecurityHeaders(response.headers);
      const corsHeaders = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (value) {
          response.headers.set(key, value);
        }
      }
      return response;
    }

    if (method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      applySecurityHeaders(response.headers);
      const corsHeaders = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (value) {
          response.headers.set(key, value);
        }
      }
      return response;
    }

    if (request.cookies.get(ACCESS_COOKIE_NAME)?.value && shouldCheckCsrf(pathname, method) && !hasValidCsrf(request)) {
      const response = NextResponse.json(
        { success: false, error: { code: "CSRF_INVALID", message: t(locale, "common.csrfInvalid") } },
        { status: 403 }
      );
      applySecurityHeaders(response.headers);
      const corsHeaders = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (value) {
          response.headers.set(key, value);
        }
      }
      return response;
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/organiser")) {
    const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) {
      const response = NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    if (pathname.startsWith("/admin") && payload.role !== "SUPER_ADMIN") {
      const response = NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    if (pathname.startsWith("/organiser") && payload.role !== "ORGANISER") {
      const response = NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }
  }

  if (LOCALE_PREFIX_EXCLUSION.some((prefix) => pathname.startsWith(prefix))) {
    const response = NextResponse.next();
    applySecurityHeaders(response.headers);
    if (pathname.startsWith("/api")) {
      const corsHeaders = getCorsHeaders(request.headers.get("origin"));
      for (const [key, value] of Object.entries(corsHeaders)) {
        if (value) {
          response.headers.set(key, value);
        }
      }
    }
    return response;
  }

  const [, maybeLocale] = pathname.split("/");
  if (!maybeLocale || !isSupportedLocale(maybeLocale)) {
    const target = request.nextUrl.clone();
    target.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(target);
    applySecurityHeaders(response.headers);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  return response;
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
