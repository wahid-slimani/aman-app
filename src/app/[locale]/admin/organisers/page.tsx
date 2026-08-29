import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import AdminOrganisersPanel from "@/features/admin/components/admin-organisers-panel";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrganisersPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const organisers = await prisma.organiserProfile.findMany({
    include: {
      user: { select: { id: true, username: true, status: true, lastLoginAt: true, createdAt: true } },
      aidPoints: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  const rows = organisers.map((o) => ({
    id: o.user.id,
    profileId: o.id,
    username: o.user.username,
    displayName: o.displayName,
    organisationName: o.organisationName,
    status: o.user.status,
    aidPointCount: o.aidPoints.length,
    lastLoginAt: o.user.lastLoginAt?.toISOString() ?? null,
    createdAt: o.user.createdAt.toISOString()
  }));

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["admin.organisers.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.organisers.subtitle"]}</p>
      </header>
      <AdminOrganisersPanel dict={dict} rows={rows} />
    </section>
  );
}
