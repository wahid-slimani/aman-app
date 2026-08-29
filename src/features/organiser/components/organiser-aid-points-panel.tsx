"use client";

import { useState } from "react";
import QuickStatusModal from "@/features/organiser/components/quick-status-modal";
import { SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";
import { explainApiError } from "@/lib/api/client-error";

type Row = {
  id: string;
  title: string;
  publicSlug: string;
  publicationStatus: string;
  operationalStatus: string;
  version: number;
  freshness: "FRESH" | "STALE" | "CRITICAL" | "UNKNOWN";
  openReports: number;
  updatedAt: string;
};

type Props = {
  dict: Record<string, string>;
  rows: Row[];
};

const FRESHNESS_COLORS: Record<string, string> = {
  FRESH: "bg-[#e7f2e9] text-[#006233]",
  STALE: "bg-amber-100 text-amber-800",
  CRITICAL: "bg-[#fff2f5] text-[#b91c1c]",
  UNKNOWN: "bg-slate-100 text-slate-500"
};

const PUB_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-[#e7f2e9] text-[#006233]",
  ARCHIVED: "bg-slate-100 text-slate-500"
};

function buildLocaleScopedPath(pathname: string, target: string) {
  const [, maybeLocale] = pathname.split("/");
  if (SUPPORTED_LOCALES.includes(maybeLocale as AppLocale)) {
    return `/${maybeLocale}${target}`;
  }
  return target;
}

export default function OrganiserAidPointsPanel({ dict, rows }: Props) {
  const [items, setItems] = useState(rows);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [quickStatusPoint, setQuickStatusPoint] = useState<Row | null>(null);

  type ApiPayload = {
    success: boolean;
    error?: {
      message?: string;
      details?: Array<string | { code?: string; message?: string }>;
    };
  };

  async function doVerify(id: string, version: number) {
    setLoading(`verify-${id}`);
    setError("");
    try {
      const res = await authenticatedFetch(`/api/organiser/aid-points/${id}/verify`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedVersion: version })
      });
      const payload = (await res.json()) as ApiPayload;
      if (!payload.success) throw new Error(explainApiError(payload.error, dict["common.error"]));
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, freshness: "FRESH" as const, version: version + 1 } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setLoading(null);
    }
  }

  async function doSubmitReview(id: string, version: number) {
    setLoading(`review-${id}`);
    setError("");
    try {
      const res = await authenticatedFetch(`/api/organiser/aid-points/${id}/publication`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedVersion: version })
      });
      const payload = (await res.json()) as ApiPayload;
      if (!payload.success) throw new Error(explainApiError(payload.error, dict["common.error"]));
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, publicationStatus: "PENDING_REVIEW", version: version + 1 } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {quickStatusPoint ? (
        <QuickStatusModal
          currentStatus={quickStatusPoint.operationalStatus}
          dict={dict}
          onClose={() => setQuickStatusPoint(null)}
          onSuccess={(newStatus, newVersion) => {
            setItems((prev) => prev.map((r) => (r.id === quickStatusPoint.id ? { ...r, operationalStatus: newStatus, version: newVersion } : r)));
          }}
          pointId={quickStatusPoint.id}
          pointTitle={quickStatusPoint.title}
          version={quickStatusPoint.version}
        />
      ) : null}

      <div className="mb-3 flex">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#006233] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00512a]"
          onClick={() => { window.location.href = buildLocaleScopedPath(window.location.pathname, "/organiser/aid-points/create"); }}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {dict["organiser.addPoint"]}
        </button>
      </div>

      <article className="rounded-2xl border border-[#dfe7df] bg-white shadow-sm">
        {error ? <p className="px-5 pt-4 text-sm text-[#b91c1c]">{error}</p> : null}
        {items.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">{dict["organiser.aidPoints.empty"]}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#dfe7df] text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">{dict["public.title"]}</th>
                  <th className="px-4 py-3">{dict["organiser.aidPoints.publication"]}</th>
                  <th className="px-4 py-3">{dict["organiser.aidPoints.operational"]}</th>
                  <th className="px-4 py-3">{dict["organiser.aidPoints.freshness"]}</th>
                  <th className="px-4 py-3">{dict["organiser.aidPoints.reports"]}</th>
                  <th className="px-4 py-3">{dict["admin.aidPoints.updated"]}</th>
                  <th className="px-4 py-3">{dict["common.actions"]}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr className="border-b border-[#f0f5f0] last:border-0" key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#006233]">{row.title}</p>
                      <p className="text-xs text-slate-500">{row.publicSlug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PUB_STATUS_COLORS[row.publicationStatus] ?? "bg-slate-100 text-slate-700"}`}>
                        {dict[`aidPoint.pubStatus.${row.publicationStatus}`] ?? row.publicationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {dict[`aidPoint.status.${row.operationalStatus}`] ?? row.operationalStatus}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FRESHNESS_COLORS[row.freshness]}`}>
                        {dict[`organiser.ops.freshness.${row.freshness}`] ?? row.freshness}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.openReports > 0 ? (
                        <span className="rounded-full bg-[#fff2f5] px-2 py-0.5 text-xs font-semibold text-[#b91c1c]">{row.openReports}</span>
                      ) : <span className="text-xs text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(row.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          className="min-h-8 rounded-lg border border-[#d7e5d9] bg-[#f4f8f4] px-2.5 py-1 text-xs font-semibold text-[#006233] hover:bg-[#e7f2e9] disabled:opacity-50"
                          onClick={() => setQuickStatusPoint(row)}
                          type="button"
                        >
                          {dict["organiser.quickStatus"]}
                        </button>
                        <button
                          className="inline-flex min-h-8 items-center rounded-lg border border-[#d7e5d9] bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => { window.location.href = `/organiser/aid-points/${row.id}/edit`; }}
                          type="button"
                        >
                          {dict["form.edit"]}
                        </button>
                        {row.freshness !== "FRESH" ? (
                          <button
                            className="min-h-8 rounded-lg border border-[#d7e5d9] px-2.5 py-1 text-xs font-semibold text-[#006233] disabled:opacity-50"
                            disabled={loading === `verify-${row.id}`}
                            onClick={() => void doVerify(row.id, row.version)}
                            type="button"
                          >
                            {dict["organiser.ops.verify"]}
                          </button>
                        ) : null}
                        {row.publicationStatus === "DRAFT" ? (
                          <button
                            className="min-h-8 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 disabled:opacity-50"
                            disabled={loading === `review-${row.id}`}
                            onClick={() => void doSubmitReview(row.id, row.version)}
                            type="button"
                          >
                            {dict["organiser.ops.submitReview"]}
                          </button>
                        ) : null}
                        {row.publicationStatus === "PUBLISHED" ? (
                          <a
                            className="inline-flex min-h-8 items-center rounded-lg border border-[#d7e5d9] px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            href={`/ar-DZ/aid-points/${row.publicSlug}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {dict["organiser.aidPoints.viewPublic"]}
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </>
  );
}
