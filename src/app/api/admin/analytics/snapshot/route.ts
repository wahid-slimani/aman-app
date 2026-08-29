import { NextRequest } from "next/server";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { analyticsRangeSchema } from "@/lib/validation/schemas";
import { getAdminAnalyticsSnapshot, resolveRange } from "@/domain/analytics/service";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const parsed = analyticsRangeSchema.safeParse({
    range: request.nextUrl.searchParams.get("range") ?? "30d",
    start: request.nextUrl.searchParams.get("start") ?? undefined,
    end: request.nextUrl.searchParams.get("end") ?? undefined
  });

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const range = resolveRange(parsed.data.range, { start: parsed.data.start, end: parsed.data.end });
  if (!range) {
    return apiError({ code: "ANALYTICS_RANGE_INVALID", messageKey: "analytics.invalidRange", status: 400 }, locale);
  }

  const snapshot = await getAdminAnalyticsSnapshot(range);
  return apiSuccess(snapshot);
}
