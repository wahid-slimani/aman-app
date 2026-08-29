import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, isSupportedLocale, SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import { ACCESS_COOKIE_NAME, ADMIN_PORTAL_PREFIX, ORGANISER_PORTAL_PREFIX } from "@/lib/constants/app";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie";
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

function ensureLocaleInResponse(response: NextResponse, request: NextRequest): NextResponse {
  if (!request.cookies.has(LOCALE_COOKIE_NAME)) {
    const locale = resolveLocale(request.headers.get("accept-language"));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/"
    });
  }
  return response;
}

const LOCALE_PREFIX_EXCLUSION = ["/api", "/portal", "/_next", "/favicon.ico"];

function getLocaleFromRequest(request: NextRequest): AppLocale {
  const cookieStore = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieStore && SUPPORTED_LOCALES.includes(cookieStore as AppLocale)) {
    return cookieStore as AppLocale;
  }
  return resolveLocale(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const locale = getLocaleFromRequest(request);
  const pathSegments = pathname.split("/");
  const maybePathLocale = pathSegments[1];
  const pathLocale = isSupportedLocale(maybePathLocale) ? (maybePathLocale as AppLocale) : null;
  const pathAfterLocale = pathLocale ? `/${pathSegments.slice(2).join("/")}` : pathname;

  const hasAdminAlias = pathname === ADMIN_PORTAL_PREFIX || pathname.startsWith(`${ADMIN_PORTAL_PREFIX}/`);
  const hasOrganiserAlias = pathname === ORGANISER_PORTAL_PREFIX || pathname.startsWith(`${ORGANISER_PORTAL_PREFIX}/`);
  const directAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const directOrganiserPath = pathname === "/organiser" || pathname.startsWith("/organiser/");

  // Redirect non-localized dashboard paths so locale is visible in the URL.
  if (directAdminPath || directOrganiserPath) {
    const suffix = directAdminPath ? pathname.slice("/admin".length) : pathname.slice("/organiser".length);
    const dashboardType = directAdminPath ? "admin" : "organiser";
    const target = request.nextUrl.clone();
    target.pathname = `/${locale}/${dashboardType}${suffix}`;
    const response = NextResponse.redirect(target);
    applySecurityHeaders(response.headers);
    return ensureLocaleInResponse(response, request);
  }

  let protectedPathname = pathLocale ? pathAfterLocale : pathname;
  let redirectPathname: string | null = null;
  let protectedLocale = pathLocale ?? locale;

  if (hasAdminAlias) {
    const suffix = pathname.slice(ADMIN_PORTAL_PREFIX.length);
    protectedPathname = `/admin${suffix}`;
    redirectPathname = `/${locale}/admin${suffix}`;
    protectedLocale = locale;
  } else if (hasOrganiserAlias) {
    const suffix = pathname.slice(ORGANISER_PORTAL_PREFIX.length);
    protectedPathname = `/organiser${suffix}`;
    redirectPathname = `/${locale}/organiser${suffix}`;
    protectedLocale = locale;
  }

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

  const isAdminPath = protectedPathname === "/admin" || protectedPathname.startsWith("/admin/");
  const isOrganiserPath = protectedPathname === "/organiser" || protectedPathname.startsWith("/organiser/");
  const isProtected = hasAdminAlias || hasOrganiserAlias || ((isAdminPath || isOrganiserPath) && Boolean(pathLocale));

  if (isProtected) {
    const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) {
      const response = NextResponse.redirect(new URL(`/${protectedLocale}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL(`/${protectedLocale}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    if (isAdminPath && payload.role !== "SUPER_ADMIN") {
      const response = NextResponse.redirect(new URL(`/${protectedLocale}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    if (isOrganiserPath && payload.role !== "ORGANISER") {
      const response = NextResponse.redirect(new URL(`/${protectedLocale}/login`, request.url));
      applySecurityHeaders(response.headers);
      return response;
    }

    if (redirectPathname) {
      const target = request.nextUrl.clone();
      target.pathname = redirectPathname;
      const response = NextResponse.redirect(target);
      applySecurityHeaders(response.headers);
      return ensureLocaleInResponse(response, request);
    }

    // Localized /[locale]/admin or /[locale]/organiser path with valid auth — pass through
    const nextResponse = NextResponse.next();
    applySecurityHeaders(nextResponse.headers);
    return ensureLocaleInResponse(nextResponse, request);
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
