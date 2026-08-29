import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { optimisticVersionSchema } from "@/lib/validation/schemas";
import { trackAnalyticsEvent } from "@/domain/analytics/service";
import { AnalyticsEventType } from "@prisma/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) {
    return access.response;
  }

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = optimisticVersionSchema.safeParse(body);

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
    select: {
      id: true,
      organiserId: true
    }
  });

  if (!point) {
    return apiError({ code: "AID_POINT_NOT_FOUND", messageKey: "aidPoint.notFound", status: 404 }, locale);
  }

  if (point.organiserId !== organiser.id) {
    return apiError({ code: "AUTH_FORBIDDEN", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.aidPoint.updateMany({
      where: {
        id: point.id,
        version: parsed.data.expectedVersion
      },
      data: {
        lastVerifiedAt: new Date(),
        operationalStatus: "OPEN",
        version: {
          increment: 1
        }
      }
    });

    if (updateResult.count === 0) {
      return null;
    }

    const verification = await tx.aidPointVerification.create({
      data: {
        aidPointId: point.id,
        actorUserId: access.auth.sub,
        note: parsed.data.verificationNote
      }
    });

    const updated = await tx.aidPoint.findUnique({
      where: { id: point.id },
      select: {
        id: true,
        version: true,
        lastVerifiedAt: true,
        operationalStatus: true
      }
    });

    if (!updated) {
      return null;
    }

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: "AID_POINT_VERIFIED",
        entityType: "AidPoint",
        entityId: updated.id,
        metadata: {
          verificationId: verification.id,
          version: updated.version
        }
      }
    });

    return updated;
  });

  if (!result) {
    return apiError({ code: "VERSION_CONFLICT", messageKey: "common.versionConflict", status: 409 }, locale);
  }

  await trackAnalyticsEvent({
    type: AnalyticsEventType.AID_POINT_VERIFIED,
    source: "organiser",
    locale,
    userRole: "ORGANISER",
    userId: access.auth.sub,
    aidPointId: result.id
  });

  return apiSuccess(result);
}
