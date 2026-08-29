import { getDictionary } from "@/i18n/dictionaries";
import { prisma } from "@/infrastructure/database/prisma";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function AdminAuditPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  const logs = await prisma.auditLog.findMany({
    include: { actorUser: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#006233]">{dict["admin.audit.title"]}</h1>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.audit.subtitle"]}</p>
      </header>
      <article className="rounded-2xl border border-[#dfe7df] bg-white shadow-sm">
        {logs.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">{dict["admin.audit.empty"]}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dfe7df] text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">{dict["admin.audit.when"]}</th>
                <th className="px-4 py-3">{dict["admin.audit.actor"]}</th>
                <th className="px-4 py-3">{dict["admin.audit.action"]}</th>
                <th className="px-4 py-3">{dict["admin.audit.entity"]}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr className="border-b border-[#f0f5f0] last:border-0" key={log.id}>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{log.actorUser?.username ?? dict["common.unknown"]}</td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">{log.action}</code>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.entityType}:{log.entityId.slice(0, 8)}
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
