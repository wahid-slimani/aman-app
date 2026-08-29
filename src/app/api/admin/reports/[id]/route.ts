import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { resolveLocale } from "@/lib/api/locale";
import { requireRole } from "@/lib/security/authorization";
import { prisma } from "@/infrastructure/database/prisma";
import { reportReviewSchema } from "@/lib/validation/schemas";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = reportReviewSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const existing = await prisma.aidPointReport.findUnique({
    where: { id: params.id },
    select: { id: true }
  });

  if (!existing) {
    return apiError({ code: "REPORT_NOT_FOUND", messageKey: "report.notFound", status: 404 }, locale);
  }

  const reviewedAt = parsed.data.status === "RESOLVED" || parsed.data.status === "DISMISSED" ? new Date() : null;

  const updated = await prisma.$transaction(async (tx) => {
    const report = await tx.aidPointReport.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        reviewedById: access.auth.sub,
        reviewedAt,
        resolutionNote: parsed.data.resolutionNote
      }
    });

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: "REPORT_STATUS_UPDATED",
        entityType: "AidPointReport",
        entityId: report.id,
        metadata: {
          status: report.status
        }
      }
    });

    return report;
  });

  return apiSuccess({
    id: updated.id,
    status: updated.status,
    reviewedAt: updated.reviewedAt
  });
}
