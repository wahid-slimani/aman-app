import { getDictionary } from "@/i18n/dictionaries";
import { AdminOpsPanel } from "@/features/operational-quality/components/admin-ops-panel";
import { prisma } from "@/infrastructure/database/prisma";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";

const STALE_HOURS = 72;

function staleThresholdDate() {
  return new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);
}

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOverviewPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [initialThresholds, initialReports, organiserCount, totalPoints, publishedPoints, blockedOrganisers, stalePoints] = await Promise.all([
    getVerificationThresholdSettings(),
    prisma.aidPointReport.findMany({
      where: { status: "OPEN" },
      include: { aidPoint: { select: { id: true, publicSlug: true } } },
      orderBy: { createdAt: "desc" },
      take: 40
    }),
    prisma.organiserProfile.count(),
    prisma.aidPoint.count(),
    prisma.aidPoint.count({ where: { publicationStatus: "PUBLISHED" } }),
    prisma.user.count({ where: { status: "BLOCKED" } }),
    prisma.aidPoint.count({
      where: {
        publicationStatus: "PUBLISHED",
        OR: [{ lastVerifiedAt: null }, { lastVerifiedAt: { lt: staleThresholdDate() } }]
      }
    })
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["admin.ops.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.ops.subtitle"]}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <article className="rounded-xl border border-[#dfe7df] bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{dict["admin.kpi.totalPoints"]}</p>
          <p className="mt-1 text-2xl font-semibold text-[#006233]">{totalPoints}</p>
        </article>
        <article className="rounded-xl border border-[#dfe7df] bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{dict["admin.kpi.activePoints"]}</p>
          <p className="mt-1 text-2xl font-semibold text-[#006233]">{publishedPoints}</p>
        </article>
        <article className="rounded-xl border border-[#dfe7df] bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{dict["admin.kpi.organisers"]}</p>
          <p className="mt-1 text-2xl font-semibold text-[#006233]">{organiserCount}</p>
        </article>
        <article className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{dict["admin.kpi.openReports"]}</p>
          <p className="mt-1 text-2xl font-semibold text-[#d21034]">{initialReports.length}</p>
        </article>
        <article className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{dict["admin.kpi.blockedOrganisers"]}</p>
          <p className="mt-1 text-2xl font-semibold text-[#d21034]">{blockedOrganisers}</p>
        </article>
        <article className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">{dict["admin.kpi.stalePoints"]}</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{stalePoints}</p>
        </article>
      </section>

      <AdminOpsPanel dict={dict} initialReports={initialReports} initialThresholds={initialThresholds} />
    </section>
  );
}
