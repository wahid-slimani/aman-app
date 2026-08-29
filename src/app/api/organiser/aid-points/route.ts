import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { classifyVerificationFreshness } from "@/domain/operational-quality/freshness";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";
import { createAidPointSchema } from "@/lib/validation/schemas";
import crypto from "node:crypto";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) {
    return access.response;
  }

  const organiser = await prisma.organiserProfile.findUnique({
    where: { userId: access.auth.sub },
    select: { id: true }
  });

  if (!organiser) {
    return apiError({ code: "ORGANISER_PROFILE_MISSING", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const thresholds = await getVerificationThresholdSettings();

  const data = await prisma.aidPoint.findMany({
    where: { organiserId: organiser.id },
    include: {
      translations: true,
      reports: { where: { status: { in: ["OPEN", "UNDER_REVIEW"] } }, select: { id: true, status: true } }
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  return apiSuccess(
    data.map((point) => ({
      id: point.id,
      publicSlug: point.publicSlug,
      publicationStatus: point.publicationStatus,
      operationalStatus: point.operationalStatus,
      version: point.version,
      lastVerifiedAt: point.lastVerifiedAt,
      freshness: classifyVerificationFreshness(point.lastVerifiedAt, thresholds),
      openReports: point.reports.length,
      title:
        point.translations.find((t) => t.locale === locale)?.name ??
        point.translations[0]?.name ??
        point.publicSlug
    }))
  );
}

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) {
    return access.response;
  }

  const organiser = await prisma.organiserProfile.findUnique({
    where: { userId: access.auth.sub },
    select: { id: true }
  });

  if (!organiser) {
    return apiError({ code: "ORGANISER_PROFILE_MISSING", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const body = await request.json().catch(() => null);
  const parsed = createAidPointSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const existing = await prisma.aidPoint.findUnique({ where: { publicSlug: parsed.data.publicSlug } });
  if (existing) {
    return apiError({ code: "SLUG_TAKEN", messageKey: "aidPoint.slugTaken", status: 409 }, locale);
  }

  const id = `c${crypto.randomBytes(20).toString("hex")}`;
  const { latitude, longitude, publicSlug, primaryPhone, secondaryPhone, whatsappPhone, googleMapsUrl } = parsed.data;
  const now = new Date();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "AidPoint" (
      id, "publicSlug", "organiserId",
      "publicationStatus", "operationalStatus",
      latitude, longitude, location,
      "primaryPhone", "secondaryPhone", "whatsappPhone", "googleMapsUrl",
      version, "createdAt", "updatedAt"
    ) VALUES (
      ${id}, ${publicSlug}, ${organiser.id},
      'DRAFT', 'NEEDS_VERIFICATION',
      ${latitude}, ${longitude}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${primaryPhone}, ${secondaryPhone ?? null}, ${whatsappPhone ?? null}, ${googleMapsUrl ?? null},
      1, ${now}, ${now}
    )
  `);

  await prisma.aidPointTranslation.createMany({
    data: parsed.data.translations.map((t) => ({
      aidPointId: id,
      locale: t.locale,
      name: t.name,
      address: t.address,
      wilaya: t.wilaya,
      commune: t.commune,
      description: t.description ?? null,
      neededItems: t.neededItems ?? null
    }))
  });

  const created = await prisma.aidPoint.findUnique({ where: { id }, include: { translations: true } });
  void created; // queried to confirm insert succeeded
  return apiSuccess({ id, publicSlug });
}
