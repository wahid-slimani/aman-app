import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { optimisticVersionSchema, updateAidPointSchema } from "@/lib/validation/schemas";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function resolveOwnership(locale: ReturnType<typeof resolveLocale>, sub: string, id: string) {
  const [organiser, point] = await Promise.all([
    prisma.organiserProfile.findUnique({ where: { userId: sub }, select: { id: true } }),
    prisma.aidPoint.findUnique({ where: { id } })
  ]);

  if (!organiser) return { ok: false as const, reason: "ORGANISER_PROFILE_MISSING" as const };
  if (!point) return { ok: false as const, reason: "AID_POINT_NOT_FOUND" as const };
  if (point.organiserId !== organiser.id) return { ok: false as const, reason: "AUTH_FORBIDDEN" as const };
  return { ok: true as const, organiser, point };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) return access.response;

  const params = await context.params;
  const result = await resolveOwnership(locale, access.auth.sub, params.id);
  if (!result.ok) {
    return apiError({ code: result.reason, messageKey: "auth.forbidden", status: result.reason === "AID_POINT_NOT_FOUND" ? 404 : 403 }, locale);
  }

  const point = await prisma.aidPoint.findUnique({
    where: { id: params.id },
    include: { translations: true }
  });

  return apiSuccess(point);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) return access.response;

  const params = await context.params;
  const result = await resolveOwnership(locale, access.auth.sub, params.id);
  if (!result.ok) {
    return apiError({ code: result.reason, messageKey: "auth.forbidden", status: result.reason === "AID_POINT_NOT_FOUND" ? 404 : 403 }, locale);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAidPointSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  if (parsed.data.expectedVersion !== result.point.version) {
    return apiError({ code: "VERSION_CONFLICT", messageKey: "common.versionConflict", status: 409 }, locale);
  }

  const { latitude, longitude, primaryPhone, secondaryPhone, whatsappPhone, googleMapsUrl } = parsed.data;
  const now = new Date();

  await prisma.$executeRaw(Prisma.sql`
    UPDATE "AidPoint"
    SET latitude = ${latitude},
        longitude = ${longitude},
        location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        "primaryPhone" = ${primaryPhone},
        "secondaryPhone" = ${secondaryPhone ?? null},
        "whatsappPhone" = ${whatsappPhone ?? null},
        "googleMapsUrl" = ${googleMapsUrl ?? null},
        version = version + 1,
        "updatedAt" = ${now}
    WHERE id = ${params.id}
  `);

  for (const t of parsed.data.translations) {
    await prisma.aidPointTranslation.upsert({
      where: { aidPointId_locale: { aidPointId: params.id, locale: t.locale } },
      create: {
        aidPointId: params.id,
        locale: t.locale,
        name: t.name,
        address: t.address,
        wilaya: t.wilaya,
        commune: t.commune,
        description: t.description ?? null,
        neededItems: t.neededItems ?? null
      },
      update: {
        name: t.name,
        address: t.address,
        wilaya: t.wilaya,
        commune: t.commune,
        description: t.description ?? null,
        neededItems: t.neededItems ?? null
      }
    });
  }

  await prisma.auditLog.create({
    data: { actorUserId: access.auth.sub, action: "AID_POINT_UPDATED", entityType: "AidPoint", entityId: params.id }
  });

  return apiSuccess({ id: params.id, updated: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) return access.response;

  const params = await context.params;
  const result = await resolveOwnership(locale, access.auth.sub, params.id);
  if (!result.ok) {
    return apiError({ code: result.reason, messageKey: "auth.forbidden", status: result.reason === "AID_POINT_NOT_FOUND" ? 404 : 403 }, locale);
  }

  const body = await request.json().catch(() => null);
  const parsed = optimisticVersionSchema.safeParse(body);
  if (!parsed.success || !parsed.data.operationalStatus) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.aidPoint.updateMany({
      where: { id: result.point.id, version: parsed.data.expectedVersion },
      data: { operationalStatus: parsed.data.operationalStatus, version: { increment: 1 } }
    });

    if (res.count === 0) return null;

    const current = await tx.aidPoint.findUnique({ where: { id: result.point.id }, select: { id: true, operationalStatus: true, version: true } });
    if (!current) return null;

    await tx.auditLog.create({
      data: {
        actorUserId: access.auth.sub,
        action: "AID_POINT_OPERATIONAL_STATUS_UPDATED",
        entityType: "AidPoint",
        entityId: current.id,
        metadata: { operationalStatus: current.operationalStatus }
      }
    });

    return current;
  });

  if (!updated) {
    return apiError({ code: "VERSION_CONFLICT", messageKey: "common.versionConflict", status: 409 }, locale);
  }

  return apiSuccess({ id: updated.id, operationalStatus: updated.operationalStatus, version: updated.version });
}
