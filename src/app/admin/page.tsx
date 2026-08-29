import { getDictionary } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE } from "@/i18n/config";

export default function AdminOverviewPage() {
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <main className="p-4 md:p-6">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-xl bg-white p-4 shadow-sm">{dict["admin.kpi.totalPoints"]}</article>
        <article className="rounded-xl bg-white p-4 shadow-sm">{dict["admin.kpi.activePoints"]}</article>
        <article className="rounded-xl bg-white p-4 shadow-sm">{dict["admin.kpi.openReports"]}</article>
      </section>
    </main>
  );
}
