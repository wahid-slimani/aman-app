import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function AdminDatasetPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  const versions = await prisma.datasetVersion.findMany({
    include: {
      createdBy: { select: { username: true } },
      _count: { select: { changes: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["admin.dataset.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.dataset.subtitle"]}</p>
      </header>
      <article className="rounded-2xl border border-[#dfe7df] bg-white shadow-sm">
        {versions.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">{dict["admin.dataset.empty"]}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dfe7df] text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">{dict["admin.dataset.version"]}</th>
                <th className="px-4 py-3">{dict["admin.dataset.changes"]}</th>
                <th className="px-4 py-3">{dict["admin.dataset.createdAt"]}</th>
                <th className="px-4 py-3">{dict["admin.dataset.createdBy"]}</th>
                <th className="px-4 py-3">{dict["common.actions"]}</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr className="border-b border-[#f0f5f0] last:border-0" key={v.id}>
                  <td className="px-4 py-3 font-semibold text-[#006233]">v{v.version}</td>
                  <td className="px-4 py-3 text-slate-700">{v._count.changes}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{v.createdBy?.username ?? dict["common.unknown"]}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400">{dict["admin.dataset.rollback"]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </section>
  );
}
