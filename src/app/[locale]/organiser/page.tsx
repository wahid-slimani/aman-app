import { getDictionary } from "@/i18n/dictionaries";
import { OrganiserOpsPanel } from "@/features/operational-quality/components/organiser-ops-panel";
import { getRequestAuth } from "@/lib/security/request-auth";
import { prisma } from "@/infrastructure/database/prisma";
import { classifyVerificationFreshness } from "@/domain/operational-quality/freshness";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OrganiserOverviewPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const auth = await getRequestAuth();
  const thresholds = await getVerificationThresholdSettings();

  let initialPoints: Array<{
    id: string;
    title: string;
    publicSlug: string;
    publicationStatus: string;
    operationalStatus: string;
    version: number;
    freshness: "FRESH" | "STALE" | "CRITICAL" | "UNKNOWN";
    openReports: number;
  }> = [];

  if (auth?.role === "ORGANISER") {
    const organiser = await prisma.organiserProfile.findUnique({
      where: {
        userId: auth.sub
      },
      select: {
        id: true
      }
    });

    if (organiser) {
      const points = await prisma.aidPoint.findMany({
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
              id: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: 100
      });

      initialPoints = points.map((point) => ({
        id: point.id,
        title: point.translations[0]?.name ?? point.publicSlug,
        publicSlug: point.publicSlug,
        publicationStatus: point.publicationStatus,
        operationalStatus: point.operationalStatus,
        version: point.version,
        freshness: classifyVerificationFreshness(point.lastVerifiedAt, thresholds),
        openReports: point.reports.length
      }));
    }
  }

  return (
    <main className="min-h-dvh bg-slate-100 p-4 md:p-6">
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <header className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-emerald-800">{dict["organiser.ops.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["organiser.ops.subtitle"]}</p>
        </header>
        <OrganiserOpsPanel dict={dict} initialPoints={initialPoints} />
      </section>
    </main>
  );
}
