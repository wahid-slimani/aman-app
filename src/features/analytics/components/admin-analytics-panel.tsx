type AdminAnalyticsPanelProps = {
  dict: Record<string, string>;
  activeRange: string;
  snapshot: {
    kpis: {
      events: number;
      reportsOpen: number;
      stalePoints: number;
    };
    geo: Array<{
      wilaya: string;
      total: number;
    }>;
    organiserActivity: Array<{
      organiserId: string;
      updates: number;
    }>;
  };
};

const RANGES = ["today", "7d", "30d", "90d"] as const;

export function AdminAnalyticsPanel({ dict, activeRange, snapshot }: AdminAnalyticsPanelProps) {
  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((range) => (
            <a
              key={range}
              href={`/admin/analytics?range=${range}`}
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
          <p className="text-sm text-slate-500">{dict["analytics.admin.kpi.events"]}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{snapshot.kpis.events}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{dict["analytics.admin.kpi.openReports"]}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{snapshot.kpis.reportsOpen}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{dict["analytics.admin.kpi.stalePoints"]}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{snapshot.kpis.stalePoints}</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">{dict["analytics.admin.geoTitle"]}</h2>
          <ul className="mt-3 space-y-2">
            {snapshot.geo.length === 0 ? (
              <li className="text-sm text-slate-500">{dict["analytics.empty"]}</li>
            ) : (
              snapshot.geo.map((row) => (
                <li key={row.wilaya} className="flex items-center justify-between text-sm text-slate-700">
                  <span>{row.wilaya}</span>
                  <span className="font-semibold text-slate-900">{row.total}</span>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">{dict["analytics.admin.activityTitle"]}</h2>
          <ul className="mt-3 space-y-2">
            {snapshot.organiserActivity.length === 0 ? (
              <li className="text-sm text-slate-500">{dict["analytics.empty"]}</li>
            ) : (
              snapshot.organiserActivity.map((row) => (
                <li key={row.organiserId} className="flex items-center justify-between text-sm text-slate-700">
                  <span>{row.organiserId.slice(0, 10)}</span>
                  <span className="font-semibold text-slate-900">{row.updates}</span>
                </li>
              ))
            )}
          </ul>
        </article>
      </div>
    </section>
  );
}
