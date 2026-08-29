import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) {
    return access.response;
  }

  const params = await context.params;

  const organiser = await prisma.organiserProfile.findUnique({
    where: {
      userId: access.auth.sub
    }
  });

  if (!organiser) {
    return apiError({ code: "ORGANISER_PROFILE_MISSING", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const point = await prisma.aidPoint.findUnique({
    where: { id: params.id }
  });

  if (!point) {
    return apiError({ code: "AID_POINT_NOT_FOUND", messageKey: "aidPoint.notFound", status: 404 }, locale);
  }

  if (point.organiserId !== organiser.id) {
    return apiError({ code: "AUTH_FORBIDDEN", messageKey: "auth.forbidden", status: 403 }, locale);
  }

  const body = await request.json().catch(() => null);
  const operationalStatus = typeof body?.operationalStatus === "string" ? body.operationalStatus : null;

  if (!operationalStatus) {
    return apiError({ code: "VALIDATION_FAILED", messageKey: "validation.invalidPayload", status: 400 }, locale);
  }

  const updated = await prisma.aidPoint.update({
    where: { id: point.id },
    data: {
      operationalStatus: operationalStatus as never,
      version: {
        increment: 1
      }
    }
  });

  return apiSuccess({
    id: updated.id,
    operationalStatus: updated.operationalStatus,
    version: updated.version
  });
}
