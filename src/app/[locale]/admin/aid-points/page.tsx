import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import AdminAidPointsPanel from "@/features/admin/components/admin-aid-points-panel";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAidPointsPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const points = await prisma.aidPoint.findMany({
    include: {
      translations: { select: { locale: true, name: true }, where: { locale } },
      organiser: { include: { user: { select: { username: true } } } }
    },
    orderBy: { updatedAt: "desc" },
    take: 200
  });

  const rows = points.map((p) => ({
    id: p.id,
    publicSlug: p.publicSlug,
    name: p.translations[0]?.name ?? p.publicSlug,
    organiserUsername: p.organiser.user.username,
    publicationStatus: p.publicationStatus,
    operationalStatus: p.operationalStatus,
    version: p.version,
    updatedAt: p.updatedAt.toISOString()
  }));

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["admin.aidPoints.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.aidPoints.subtitle"]}</p>
      </header>
      <AdminAidPointsPanel dict={dict} rows={rows} />
    </section>
  );
}
