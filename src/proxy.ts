import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { ACCESS_COOKIE_NAME } from "@/lib/constants/app";

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

  if (pathname.startsWith("/admin") || pathname.startsWith("/organiser")) {
    const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
    }

    if (pathname.startsWith("/admin") && payload.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
    }

    if (pathname.startsWith("/organiser") && payload.role !== "ORGANISER") {
      return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}/login`, request.url));
    }
  }

  if (LOCALE_PREFIX_EXCLUSION.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const [, maybeLocale] = pathname.split("/");
  if (!maybeLocale || !isSupportedLocale(maybeLocale)) {
    const target = request.nextUrl.clone();
    target.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};
