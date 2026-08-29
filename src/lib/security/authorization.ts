import { apiError } from "@/lib/api/response";
import type { AppLocale } from "@/i18n/config";
import { getRequestAuth } from "@/lib/security/request-auth";

export async function requireRole(locale: AppLocale, role: "SUPER_ADMIN" | "ORGANISER") {
  const auth = await getRequestAuth();
  if (!auth) {
    return { ok: false as const, response: apiError({ code: "AUTH_UNAUTHORIZED", messageKey: "auth.unauthorized", status: 401 }, locale) };
  }

  if (auth.role !== role) {
    return { ok: false as const, response: apiError({ code: "AUTH_FORBIDDEN", messageKey: "auth.forbidden", status: 403 }, locale) };
  }

  return { ok: true as const, auth };
}
