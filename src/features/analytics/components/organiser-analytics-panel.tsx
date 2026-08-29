type OrganiserAnalyticsPanelProps = {
  dict: Record<string, string>;
  locale: string;
  activeRange: string;
  snapshot: {
    points: number;
    reportsOpen: number;
    recentlyVerified: number;
  };
};

const RANGES = ["today", "7d", "30d", "90d"] as const;

export function OrganiserAnalyticsPanel({ dict, locale, activeRange, snapshot }: OrganiserAnalyticsPanelProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((range) => (
            <a
              key={range}
              href={`/${locale}/organiser/analytics?range=${range}`}
              className={`rounded-full px-4 py-2 text-sm ${
                activeRange === range ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {dict[`analytics.range.${range}`]}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{dict["analytics.organiser.kpi.points"]}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{snapshot.points}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{dict["analytics.organiser.kpi.openReports"]}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{snapshot.reportsOpen}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{dict["analytics.organiser.kpi.verified"]}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{snapshot.recentlyVerified}</p>
        </article>
      </div>
    </section>
  );
}
