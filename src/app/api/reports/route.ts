import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { submitReportSchema } from "@/lib/validation/schemas";
import { isRateLimited } from "@/lib/api/rate-limit";
import { prisma } from "@/infrastructure/database/prisma";
import { trackAnalyticsEvent } from "@/domain/analytics/service";
import { AnalyticsEventType } from "@prisma/client";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (isRateLimited(`reports:${ip}`, 12, 60_000)) {
    return apiError({ code: "RATE_LIMITED", messageKey: "common.rateLimited", status: 429 }, locale);
  }

  const body = await request.json().catch(() => null);
  const parsed = submitReportSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const aidPoint = await prisma.aidPoint.findUnique({
    where: { id: parsed.data.aidPointId },
    select: { id: true }
  });

  if (!aidPoint) {
    return apiError({ code: "AID_POINT_NOT_FOUND", messageKey: "aidPoint.notFound", status: 404 }, locale);
  }

  const created = await prisma.aidPointReport.create({
    data: {
      aidPointId: parsed.data.aidPointId,
      reason: parsed.data.reason,
      details: parsed.data.details,
      reporterName: parsed.data.reporterName,
      reporterPhone: parsed.data.reporterPhone
    },
    select: {
      id: true,
      status: true,
      createdAt: true
    }
  });

  await trackAnalyticsEvent({
    type: AnalyticsEventType.REPORT_SUBMITTED,
    source: "api",
    locale,
    aidPointId: parsed.data.aidPointId,
    payload: {
      reason: parsed.data.reason
    }
  });

  return apiSuccess({
    reportId: created.id,
    status: created.status,
    createdAt: created.createdAt
  });
}
