import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { CSRF_COOKIE_NAME } from "@/lib/constants/app";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_EXCLUDED_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/dev-seed",
  "/api/reports"
]);

export function getAllowedOrigins() {
  const env = process.env.ALLOWED_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const defaults = [process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"];
  return new Set([...(env ?? []), ...defaults]);
}

export function isOriginAllowed(origin: string | null) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().has(origin);
}

export function getCorsHeaders(origin: string | null) {
  const allowOrigin = origin && isOriginAllowed(origin) ? origin : null;
  return {
    "Access-Control-Allow-Origin": allowOrigin ?? "",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-CSRF-Token,Accept-Language",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin"
  };
}

export function applySecurityHeaders(headers: Headers) {
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(self), microphone=(), camera=()")
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
}

export function shouldCheckCsrf(pathname: string, method: string) {
  if (SAFE_METHODS.has(method.toUpperCase())) {
    return false;
  }

  if (!pathname.startsWith("/api/")) {
    return false;
  }

  return !CSRF_EXCLUDED_PATHS.has(pathname);
}

export function hasValidCsrf(request: NextRequest) {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) {
    return false;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (cookieBuffer.length !== headerBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(cookieBuffer, headerBuffer);
}

export function createCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}
