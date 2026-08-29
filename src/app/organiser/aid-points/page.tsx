import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import { getRequestAuth } from "@/lib/security/request-auth";
import { classifyVerificationFreshness } from "@/domain/operational-quality/freshness";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";
import OrganiserAidPointsPanel from "@/features/organiser/components/organiser-aid-points-panel";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function OrganiserAidPointsPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const auth = await getRequestAuth();
  const thresholds = await getVerificationThresholdSettings();

  let rows: Array<{
    id: string;
    title: string;
    publicSlug: string;
    publicationStatus: string;
    operationalStatus: string;
    version: number;
    freshness: "FRESH" | "STALE" | "CRITICAL" | "UNKNOWN";
    openReports: number;
    updatedAt: string;
  }> = [];

  if (auth?.role === "ORGANISER") {
    const organiser = await prisma.organiserProfile.findUnique({
      where: { userId: auth.sub },
      select: { id: true }
    });

    if (organiser) {
      const points = await prisma.aidPoint.findMany({
        where: { organiserId: organiser.id },
        include: {
          translations: { where: { locale }, select: { name: true } },
          reports: {
            where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
            select: { id: true }
          }
        },
        orderBy: { updatedAt: "desc" },
        take: 200
      });

      rows = points.map((p) => ({
        id: p.id,
        title: p.translations[0]?.name ?? p.publicSlug,
        publicSlug: p.publicSlug,
        publicationStatus: p.publicationStatus,
        operationalStatus: p.operationalStatus,
        version: p.version,
        freshness: classifyVerificationFreshness(p.lastVerifiedAt, thresholds),
        openReports: p.reports.length,
        updatedAt: p.updatedAt.toISOString()
      }));
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["organiser.aidPoints.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["organiser.aidPoints.subtitle"]}</p>
      </header>
      <OrganiserAidPointsPanel dict={dict} rows={rows} />
    </section>
  );
}
