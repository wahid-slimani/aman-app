import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import AdminReportsPanel from "@/features/admin/components/admin-reports-panel";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function AdminReportsPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  const reports = await prisma.aidPointReport.findMany({
    include: {
      aidPoint: { select: { id: true, publicSlug: true } },
      reviewedBy: { select: { username: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  const rows = reports.map((r) => ({
    id: r.id,
    aidPointSlug: r.aidPoint.publicSlug,
    aidPointId: r.aidPoint.id,
    reason: r.reason,
    details: r.details,
    status: r.status,
    reviewedBy: r.reviewedBy?.username ?? null,
    createdAt: r.createdAt.toISOString()
  }));

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["admin.reports.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.reports.subtitle"]}</p>
      </header>
      <AdminReportsPanel dict={dict} rows={rows} />
    </section>
  );
}
