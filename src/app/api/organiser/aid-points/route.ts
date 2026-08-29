import { NextRequest } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";
import { resolveLocale } from "@/lib/api/locale";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireRole } from "@/lib/security/authorization";
import { classifyVerificationFreshness } from "@/domain/operational-quality/freshness";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const access = await requireRole(locale, "ORGANISER");
  if (!access.ok) {
    return access.response;
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

  const thresholds = await getVerificationThresholdSettings();

  const data = await prisma.aidPoint.findMany({
    where: {
      organiserId: organiser.id
    },
    include: {
      translations: true,
      reports: {
        where: {
          status: {
            in: ["OPEN", "UNDER_REVIEW"]
          }
        },
        select: {
          id: true,
          status: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
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
        point.translations.find((translation) => translation.locale === locale)?.name ??
        point.translations[0]?.name ??
        point.publicSlug
    }))
  );
}
