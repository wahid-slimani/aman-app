import { NextRequest } from "next/server";
import { analyticsEventSchema } from "@/lib/validation/schemas";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { parseAnalyticsEventType, parseUserRole, trackAnalyticsEvent } from "@/domain/analytics/service";
import { getRequestAuth } from "@/lib/security/request-auth";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const body = await request.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const type = parseAnalyticsEventType(parsed.data.type);
  if (!type) {
    return apiError({ code: "ANALYTICS_EVENT_INVALID", messageKey: "analytics.invalidEvent", status: 400 }, locale);
  }

  const auth = await getRequestAuth();

  await trackAnalyticsEvent({
    type,
    source: parsed.data.source,
    locale: parsed.data.locale,
    userRole: parsed.data.userRole ?? parseUserRole(auth?.role),
    userId: auth?.sub,
    aidPointId: parsed.data.aidPointId,
    wilaya: parsed.data.wilaya,
    payload: parsed.data.payload as Prisma.InputJsonValue | undefined
  });

  return apiSuccess({ accepted: true });
}
