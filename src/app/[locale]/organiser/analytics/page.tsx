import { getDictionary } from "@/i18n/dictionaries";
import { OrganiserAnalyticsPanel } from "@/features/analytics/components/organiser-analytics-panel";
import { getRequestAuth } from "@/lib/security/request-auth";
import { getOrganiserAnalyticsSnapshot, resolveRange } from "@/domain/analytics/service";

type SearchParams = {
  range?: "today" | "7d" | "30d" | "90d" | "custom";
  start?: string;
  end?: string;
};

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function OrganiserAnalyticsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const auth = await getRequestAuth();
  const urlParams = await searchParams;
  const activeRange = urlParams.range ?? "30d";
  const resolved = resolveRange(activeRange, { start: urlParams.start, end: urlParams.end }) ?? resolveRange("30d");

  if (!auth?.sub) {
    return (
      <main className="min-h-dvh bg-[#f7f9f7] p-4 md:p-6">
        <section className="mx-auto w-full max-w-7xl rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-[#006233]">{dict["analytics.organiser.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["auth.unauthorized"]}</p>
        </section>
      </main>
    );
  }

  const snapshot = await getOrganiserAnalyticsSnapshot(resolved!, auth.sub);

  return (
    <main className="min-h-dvh bg-[#f7f9f7] p-4 md:p-6">
      <section className="mx-auto w-full max-w-7xl space-y-4">
        <header className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-[#006233]">{dict["analytics.organiser.title"]}</h1>
          <p className="mt-1 text-sm text-slate-600">{dict["analytics.organiser.subtitle"]}</p>
        </header>

        {snapshot ? (
          <OrganiserAnalyticsPanel dict={dict} locale={locale} activeRange={activeRange} snapshot={snapshot} />
        ) : (
          <article className="rounded-2xl bg-white p-5 shadow-sm text-sm text-slate-600">{dict["organiser.notFound"]}</article>
        )}
      </section>
    </main>
  );
}
