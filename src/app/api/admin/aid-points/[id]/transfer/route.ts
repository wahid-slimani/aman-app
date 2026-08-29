import { NextRequest } from "next/server";
import { DatasetChangeAction } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { ownershipTransferSchema } from "@/lib/validation/schemas";
import { createDatasetVersionChange } from "@/domain/operational-quality/workflows";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const params = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = ownershipTransferSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const point = await prisma.aidPoint.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      organiserId: true
    }
  });

  if (!point) {
    return apiError({ code: "AID_POINT_NOT_FOUND", messageKey: "aidPoint.notFound", status: 404 }, locale);
  }

  const targetOrganiser = await prisma.organiserProfile.findUnique({
    where: {
      id: parsed.data.newOrganiserId
    },
    select: {
      id: true
    }
  });

  if (!targetOrganiser) {
    return apiError({ code: "ORGANISER_NOT_FOUND", messageKey: "organiser.notFound", status: 404 }, locale);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const aidPoint = await tx.aidPoint.update({
      where: { id: point.id },
      data: {
        organiserId: targetOrganiser.id,
        version: {
          increment: 1
        }
      }
    });

    await createDatasetVersionChange(tx, {
      actorUserId: access.auth.sub,
      aidPointId: aidPoint.id,
      action: DatasetChangeAction.TRANSFER_OWNERSHIP,
      note: parsed.data.reason
    });

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: "AID_POINT_OWNERSHIP_TRANSFERRED",
        entityType: "AidPoint",
        entityId: aidPoint.id,
        metadata: {
          previousOrganiserId: point.organiserId,
          newOrganiserId: targetOrganiser.id,
          reason: parsed.data.reason
        }
      }
    });

    return aidPoint;
  });

  return apiSuccess({
    id: updated.id,
    organiserId: updated.organiserId,
    version: updated.version
  });
}
