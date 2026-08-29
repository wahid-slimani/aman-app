"use client";

import { useMemo, useState } from "react";
import { getCsrfTokenFromCookie } from "@/lib/security/csrf-client";

type Dict = Record<string, string>;

type Thresholds = {
  staleDays: number;
  criticalDays: number;
};

type ReportItem = {
  id: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  reason: string;
  details: string;
  aidPoint: {
    id: string;
    publicSlug: string;
  };
};

const REVIEW_STATUSES: Array<ReportItem["status"]> = ["UNDER_REVIEW", "RESOLVED", "DISMISSED"];

export function AdminOpsPanel({
  dict,
  initialThresholds,
  initialReports
}: {
  dict: Dict;
  initialThresholds: Thresholds;
  initialReports: ReportItem[];
}) {
  const [thresholds, setThresholds] = useState<Thresholds | null>(initialThresholds);
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [statusByReportId, setStatusByReportId] = useState<Record<string, ReportItem["status"]>>({});

  async function loadData(showLoader: boolean) {
    if (showLoader) {
      setLoading(true);
      setError("");
    }

    try {
      const [thresholdRes, reportRes] = await Promise.all([
        fetch("/api/admin/settings/verification-thresholds", { cache: "no-store" }),
        fetch("/api/admin/reports?status=OPEN", { cache: "no-store" })
      ]);

      const thresholdPayload = (await thresholdRes.json()) as {
        success: boolean;
        data?: Thresholds;
        error?: { message: string };
      };
      const reportPayload = (await reportRes.json()) as {
        success: boolean;
        data?: ReportItem[];
        error?: { message: string };
      };

      if (!thresholdPayload.success) {
        throw new Error(thresholdPayload.error?.message ?? dict["common.error"]);
      }

      if (!reportPayload.success) {
        throw new Error(reportPayload.error?.message ?? dict["common.error"]);
      }

      setThresholds(thresholdPayload.data ?? null);
      setReports(reportPayload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : dict["common.error"]);
    } finally {
      setLoading(false);
    }
  }

  const openCount = useMemo(() => reports.filter((item) => item.status === "OPEN").length, [reports]);

  async function saveThresholds(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!thresholds) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/settings/verification-thresholds", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie()
        },
        body: JSON.stringify(thresholds)
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: Thresholds;
        error?: { message: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      setThresholds(payload.data ?? thresholds);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : dict["common.error"]);
    } finally {
      setSaving(false);
    }
  }

  async function updateReportStatus(reportId: string) {
    const nextStatus = statusByReportId[reportId];
    if (!nextStatus) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-csrf-token": getCsrfTokenFromCookie()
        },
        body: JSON.stringify({ status: nextStatus, resolutionNote: dict["admin.ops.defaultResolutionNote"] })
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: { message: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      await loadData(false);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : dict["common.error"]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">{dict["common.loading"]}</p>;
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        <p>{error}</p>
        <button className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-white" onClick={() => void loadData(true)} type="button">
          {dict["common.retry"]}
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
        <h2 className="text-base font-semibold text-slate-900">{dict["admin.ops.thresholdsTitle"]}</h2>
        <p className="mt-1 text-sm text-slate-600">{dict["admin.ops.thresholdsSubtitle"]}</p>
        <form className="mt-4 space-y-3" onSubmit={saveThresholds}>
          <label className="block text-sm text-slate-700">
            {dict["admin.ops.staleDays"]}
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              min={1}
              onChange={(event) =>
                setThresholds((previous) =>
                  previous
                    ? {
                        ...previous,
                        staleDays: Number(event.target.value)
                      }
                    : previous
                )
              }
              type="number"
              value={thresholds?.staleDays ?? 30}
            />
          </label>
          <label className="block text-sm text-slate-700">
            {dict["admin.ops.criticalDays"]}
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              min={1}
              onChange={(event) =>
                setThresholds((previous) =>
                  previous
                    ? {
                        ...previous,
                        criticalDays: Number(event.target.value)
                      }
                    : previous
                )
              }
              type="number"
              value={thresholds?.criticalDays ?? 90}
            />
          </label>
          <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={saving} type="submit">
            {saving ? dict["common.saving"] : dict["common.save"]}
          </button>
        </form>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{dict["admin.ops.openReportsTitle"]}</h2>
            <p className="text-sm text-slate-600">{dict["admin.ops.openReportsCount"]}: {openCount}</p>
          </div>
        </header>

        {reports.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">{dict["admin.ops.emptyReports"]}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reports.map((report) => (
              <li className="rounded-xl border border-slate-200 p-4" key={report.id}>
                <p className="text-sm font-semibold text-slate-900">{report.aidPoint.publicSlug}</p>
                <p className="mt-1 text-sm text-slate-700">{report.reason}</p>
                <p className="mt-1 text-xs text-slate-600">{report.details}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    onChange={(event) =>
                      setStatusByReportId((previous) => ({
                        ...previous,
                        [report.id]: event.target.value as ReportItem["status"]
                      }))
                    }
                    value={statusByReportId[report.id] ?? "UNDER_REVIEW"}
                  >
                    {REVIEW_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {dict[`admin.ops.reportStatus.${status}`] ?? status}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
                    disabled={saving}
                    onClick={() => void updateReportStatus(report.id)}
                    type="button"
                  >
                    {dict["admin.ops.applyStatus"]}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
