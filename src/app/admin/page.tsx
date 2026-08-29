import { getDictionary } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { AdminOpsPanel } from "@/features/operational-quality/components/admin-ops-panel";
import { prisma } from "@/infrastructure/database/prisma";
import { getVerificationThresholdSettings } from "@/domain/operational-quality/settings";

export default async function AdminOverviewPage() {
  const dict = getDictionary(DEFAULT_LOCALE);
  const [initialThresholds, initialReports] = await Promise.all([
    getVerificationThresholdSettings(),
    prisma.aidPointReport.findMany({
      where: {
        status: "OPEN"
      },
      include: {
        aidPoint: {
          select: {
            id: true,
            publicSlug: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 40
    })
  ]);

  return (
    <main className="min-h-dvh bg-slate-100 p-4 md:p-6">
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <header className="rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">{dict["admin.ops.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["admin.ops.subtitle"]}</p>
        </header>
        <AdminOpsPanel dict={dict} initialReports={initialReports} initialThresholds={initialThresholds} />
      </section>
    </main>
  );
}
