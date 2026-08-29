import { getDictionary } from "@/i18n/dictionaries";
import { AdminAnalyticsPanel } from "@/features/analytics/components/admin-analytics-panel";
import { getAdminAnalyticsSnapshot, resolveRange } from "@/domain/analytics/service";
import { getRequestLocale } from "@/lib/i18n/request-locale";

type SearchParams = {
  range?: "today" | "7d" | "30d" | "90d" | "custom";
  start?: string;
  end?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const params = await searchParams;
  const activeRange = params.range ?? "30d";
  const resolved = resolveRange(activeRange, { start: params.start, end: params.end }) ?? resolveRange("30d");
  const snapshot = await getAdminAnalyticsSnapshot(resolved!);

  return (
    <main className="min-h-dvh bg-[#f7f9f7] p-4 md:p-6">
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-[#006233]">{dict["analytics.admin.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["analytics.admin.subtitle"]}</p>
        </header>

        <AdminAnalyticsPanel dict={dict} locale={locale} activeRange={activeRange} snapshot={snapshot} />
      </section>
    </main>
  );
}
