"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

type Row = {
  id: string;
  aidPointSlug: string;
  aidPointId: string;
  reason: string;
  details: string;
  status: string;
  reviewedBy: string | null;
  createdAt: string;
};

type Props = {
  dict: Record<string, string>;
  rows: Row[];
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-[#e7f2e9] text-[#006233]",
  DISMISSED: "bg-slate-100 text-slate-500"
};

export default function AdminReportsPanel({ dict, rows }: Props) {
  const [items, setItems] = useState(rows);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function applyStatus(id: string, status: "UNDER_REVIEW" | "RESOLVED" | "DISMISSED") {
    setLoading(id);
    setError("");

    try {
      const res = await authenticatedFetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!payload.success) throw new Error(payload.error?.message);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <article className="rounded-2xl border border-[#dfe7df] bg-white shadow-sm">
      {error ? <p className="px-5 pt-4 text-sm text-[#b91c1c]">{error}</p> : null}
      {items.length === 0 ? (
        <p className="p-5 text-sm text-slate-600">{dict["admin.reports.empty"]}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dfe7df] text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">{dict["admin.reports.point"]}</th>
                <th className="px-4 py-3">{dict["admin.reports.reason"]}</th>
                <th className="px-4 py-3">{dict["admin.reports.status"]}</th>
                <th className="px-4 py-3">{dict["admin.reports.submitted"]}</th>
                <th className="px-4 py-3">{dict["common.actions"]}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr className="border-b border-[#f0f5f0] last:border-0" key={row.id}>
                  <td className="px-4 py-3">
                    <a className="font-medium text-[#006233] underline" href={`/ar-DZ/aid-points/${row.aidPointSlug}`}>
                      {row.aidPointSlug}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{row.reason}</p>
                    <p className="line-clamp-2 max-w-xs text-xs text-slate-500">{row.details}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[row.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {dict[`admin.ops.reportStatus.${row.status}`] ?? row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {row.status === "OPEN" ? (
                      <div className="flex flex-wrap gap-1">
                        <button
                          className="min-h-8 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                          disabled={loading === row.id}
                          onClick={() => void applyStatus(row.id, "UNDER_REVIEW")}
                          type="button"
                        >
                          {dict["admin.reports.underReview"]}
                        </button>
                        <button
                          className="min-h-8 rounded-lg border border-[#d7e5d9] bg-[#f4f8f4] px-2.5 py-1 text-xs font-semibold text-[#006233] hover:bg-[#e7f2e9] disabled:opacity-50"
                          disabled={loading === row.id}
                          onClick={() => void applyStatus(row.id, "RESOLVED")}
                          type="button"
                        >
                          {dict["admin.reports.resolve"]}
                        </button>
                        <button
                          className="min-h-8 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          disabled={loading === row.id}
                          onClick={() => void applyStatus(row.id, "DISMISSED")}
                          type="button"
                        >
                          {dict["admin.reports.dismiss"]}
                        </button>
                      </div>
                    ) : row.status === "UNDER_REVIEW" ? (
                      <div className="flex flex-wrap gap-1">
                        <button
                          className="min-h-8 rounded-lg border border-[#d7e5d9] bg-[#f4f8f4] px-2.5 py-1 text-xs font-semibold text-[#006233] hover:bg-[#e7f2e9] disabled:opacity-50"
                          disabled={loading === row.id}
                          onClick={() => void applyStatus(row.id, "RESOLVED")}
                          type="button"
                        >
                          {dict["admin.reports.resolve"]}
                        </button>
                        <button
                          className="min-h-8 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          disabled={loading === row.id}
                          onClick={() => void applyStatus(row.id, "DISMISSED")}
                          type="button"
                        >
                          {dict["admin.reports.dismiss"]}
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
