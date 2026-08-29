import { NextRequest } from "next/server";
import { DatasetChangeAction } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { publicationReviewSchema } from "@/lib/validation/schemas";
import { checkPublicationPrerequisites, createDatasetVersionChange } from "@/domain/operational-quality/workflows";
import { trackAnalyticsEvent } from "@/domain/analytics/service";
import { AnalyticsEventType } from "@prisma/client";

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
  const parsed = publicationReviewSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const point = await prisma.aidPoint.findUnique({
    where: { id: params.id },
    include: { translations: true }
  });

  if (!point) {
    return apiError({ code: "AID_POINT_NOT_FOUND", messageKey: "aidPoint.notFound", status: 404 }, locale);
  }

  if (parsed.data.action === "PUBLISH") {
    const prerequisites = checkPublicationPrerequisites(point);
    if (!prerequisites.ok) {
      return apiError({ code: "PUBLICATION_PREREQUISITES_MISSING", messageKey: "publication.prerequisitesMissing", status: 422 }, locale);
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const nextStatus =
      parsed.data.action === "PUBLISH"
        ? "PUBLISHED"
        : parsed.data.action === "ARCHIVE"
          ? "ARCHIVED"
          : parsed.data.action === "REJECT"
            ? "DRAFT"
            : "PENDING_REVIEW";

    const updated = await tx.aidPoint.update({
      where: {
        id: point.id
      },
      data: {
        publicationStatus: nextStatus,
        publishedAt: parsed.data.action === "PUBLISH" ? new Date() : point.publishedAt,
        archivedAt: parsed.data.action === "ARCHIVE" ? new Date() : point.archivedAt,
        version: {
          increment: 1
        }
      }
    });

    const datasetAction =
      parsed.data.action === "PUBLISH"
        ? DatasetChangeAction.PUBLISH
        : parsed.data.action === "ARCHIVE"
          ? DatasetChangeAction.ARCHIVE
          : DatasetChangeAction.UPDATE_STATUS;

    await createDatasetVersionChange(tx, {
      actorUserId: access.auth.sub,
      aidPointId: updated.id,
      action: datasetAction,
      note: parsed.data.note
    });

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: `AID_POINT_PUBLICATION_${parsed.data.action}`,
        entityType: "AidPoint",
        entityId: updated.id,
        metadata: {
          publicationStatus: updated.publicationStatus,
          version: updated.version,
          note: parsed.data.note
        }
      }
    });

    return updated;
  });

  if (parsed.data.action === "PUBLISH") {
    await trackAnalyticsEvent({
      type: AnalyticsEventType.AID_POINT_PUBLISHED,
      source: "admin",
      locale,
      userRole: "SUPER_ADMIN",
      userId: access.auth.sub,
      aidPointId: result.id
    });
  }

  if (parsed.data.action === "ARCHIVE") {
    await trackAnalyticsEvent({
      type: AnalyticsEventType.AID_POINT_ARCHIVED,
      source: "admin",
      locale,
      userRole: "SUPER_ADMIN",
      userId: access.auth.sub,
      aidPointId: result.id
    });
  }

  return apiSuccess({
    id: result.id,
    publicationStatus: result.publicationStatus,
    version: result.version,
    publishedAt: result.publishedAt,
    archivedAt: result.archivedAt
  });
}
