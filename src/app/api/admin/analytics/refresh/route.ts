import { NextRequest } from "next/server";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { analyticsRangeSchema } from "@/lib/validation/schemas";
import { refreshAnalyticsAggregates, resolveRange } from "@/domain/analytics/service";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const body = await request.json().catch(() => ({}));
  const parsed = analyticsRangeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const range = resolveRange(parsed.data.range, { start: parsed.data.start, end: parsed.data.end });
  if (!range) {
    return apiError({ code: "ANALYTICS_RANGE_INVALID", messageKey: "analytics.invalidRange", status: 400 }, locale);
  }

  await refreshAnalyticsAggregates(range);
  return apiSuccess({ refreshed: true });
}
