import { NextRequest } from "next/server";
import { DatasetChangeAction } from "@prisma/client";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { rollbackSchema } from "@/lib/validation/schemas";
import { createDatasetVersionChange } from "@/domain/operational-quality/workflows";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "SUPER_ADMIN");
  if (!access.ok) {
    return access.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = rollbackSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const sourceChange = await prisma.datasetChange.findUnique({
    where: {
      id: parsed.data.datasetChangeId
    },
    select: {
      id: true,
      aidPointId: true,
      publicationStatus: true,
      operationalStatus: true,
      snapshot: true
    }
  });

  if (!sourceChange) {
    return apiError({ code: "DATASET_CHANGE_NOT_FOUND", messageKey: "dataset.changeNotFound", status: 404 }, locale);
  }

  const rolledBack = await prisma.$transaction(async (tx) => {
    const updated = await tx.aidPoint.update({
      where: {
        id: sourceChange.aidPointId
      },
      data: {
        publicationStatus: sourceChange.publicationStatus,
        operationalStatus: sourceChange.operationalStatus,
        version: {
          increment: 1
        }
      }
    });

    await createDatasetVersionChange(tx, {
      actorUserId: access.auth.sub,
      aidPointId: sourceChange.aidPointId,
      action: DatasetChangeAction.ROLLBACK,
      note: parsed.data.note
    });

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: "DATASET_ROLLBACK_APPLIED",
        entityType: "DatasetChange",
        entityId: sourceChange.id,
        metadata: {
          aidPointId: sourceChange.aidPointId,
          note: parsed.data.note,
          sourceSnapshot: sourceChange.snapshot
        }
      }
    });

    return updated;
  });

  return apiSuccess({
    aidPointId: rolledBack.id,
    publicationStatus: rolledBack.publicationStatus,
    operationalStatus: rolledBack.operationalStatus,
    version: rolledBack.version
  });
}
