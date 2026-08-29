import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { publicationSubmitSchema } from "@/lib/validation/schemas";
import { checkPublicationPrerequisites, type PublicationPrerequisiteCode } from "@/domain/operational-quality/workflows";
import { trackAnalyticsEvent } from "@/domain/analytics/service";
import { AnalyticsEventType } from "@prisma/client";
import { t } from "@/lib/api/messages";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const PREREQUISITE_MESSAGE_KEYS: Record<PublicationPrerequisiteCode, string> = {
  MISSING_OWNER: "publication.prerequisite.MISSING_OWNER",
  MISSING_PRIMARY_PHONE: "publication.prerequisite.MISSING_PRIMARY_PHONE",
  MISSING_VERIFICATION: "publication.prerequisite.MISSING_VERIFICATION",
  INVALID_OPERATIONAL_STATUS: "publication.prerequisite.INVALID_OPERATIONAL_STATUS",
  MISSING_TRANSLATIONS: "publication.prerequisite.MISSING_TRANSLATIONS"
};

export async function POST(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) {
    return access.response;
  }

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = publicationSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const organiser = await prisma.organiserProfile.findUnique({
    where: {
      userId: access.auth.sub
    },
    select: {
      id: true
    }
  });

  if (!organiser) {
    return apiError({ code: "ORGANISER_PROFILE_MISSING", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const point = await prisma.aidPoint.findUnique({
    where: {
      id: params.id
    },
    include: {
      translations: true
    }
  });

  if (!point) {
    return apiError({ code: "AID_POINT_NOT_FOUND", messageKey: "aidPoint.notFound", status: 404 }, locale);
  }

  if (point.organiserId !== organiser.id) {
    return apiError({ code: "AUTH_FORBIDDEN", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const prerequisites = checkPublicationPrerequisites(point);
  if (!prerequisites.ok) {
    const details = prerequisites.missing.map((code) => ({
      code,
      message: t(locale, PREREQUISITE_MESSAGE_KEYS[code])
    }));

    return apiError(
      {
        code: "PUBLICATION_PREREQUISITES_MISSING",
        messageKey: "publication.prerequisitesMissing",
        status: 422,
        details
      },
      locale
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.aidPoint.updateMany({
      where: {
        id: point.id,
        version: parsed.data.expectedVersion
      },
      data: {
        publicationStatus: "PENDING_REVIEW",
        version: {
          increment: 1
        }
      }
    });

    if (updateResult.count === 0) {
      return null;
    }

    const current = await tx.aidPoint.findUnique({
      where: { id: point.id },
      select: {
        id: true,
        publicationStatus: true,
        version: true
      }
    });

    if (!current) {
      return null;
    }

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: "AID_POINT_SUBMITTED_FOR_REVIEW",
        entityType: "AidPoint",
        entityId: current.id,
        metadata: {
          version: current.version,
          note: parsed.data.note
        }
      }
    });

    return current;
  });

  if (!updated) {
    return apiError({ code: "VERSION_CONFLICT", messageKey: "common.versionConflict", status: 409 }, locale);
  }

  await trackAnalyticsEvent({
    type: AnalyticsEventType.AID_POINT_PUBLICATION_SUBMITTED,
    source: "organiser",
    locale,
    userRole: "ORGANISER",
    userId: access.auth.sub,
    aidPointId: updated.id
  });

  return apiSuccess(updated);
}
