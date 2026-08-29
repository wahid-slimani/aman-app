"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

type Row = {
  id: string;
  publicSlug: string;
  name: string;
  organiserUsername: string;
  publicationStatus: string;
  operationalStatus: string;
  version: number;
  updatedAt: string;
};

type Props = {
  dict: Record<string, string>;
  rows: Row[];
};

const PUB_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-[#e7f2e9] text-[#006233]",
  ARCHIVED: "bg-slate-100 text-slate-500"
};

export default function AdminAidPointsPanel({ dict, rows }: Props) {
  const [items, setItems] = useState(rows);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function applyAction(id: string, action: "PUBLISH" | "REJECT" | "ARCHIVE", version: number) {
    setLoading(id);
    setError("");

    try {
      const res = await authenticatedFetch(`/api/admin/aid-points/${id}/publication`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, expectedVersion: version })
      });
      const payload = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!payload.success) throw new Error(payload.error?.message);

      const nextStatus = action === "PUBLISH" ? "PUBLISHED" : action === "ARCHIVE" ? "ARCHIVED" : "DRAFT";
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, publicationStatus: nextStatus, version: version + 1 } : r))
      );
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
        <p className="p-5 text-sm text-slate-600">{dict["admin.aidPoints.empty"]}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dfe7df] text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">{dict["public.title"]}</th>
                <th className="px-4 py-3">{dict["admin.aidPoints.organiser"]}</th>
                <th className="px-4 py-3">{dict["admin.aidPoints.publication"]}</th>
                <th className="px-4 py-3">{dict["admin.aidPoints.operational"]}</th>
                <th className="px-4 py-3">{dict["admin.aidPoints.updated"]}</th>
                <th className="px-4 py-3">{dict["common.actions"]}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr className="border-b border-[#f0f5f0] last:border-0" key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#006233]">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.publicSlug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.organiserUsername}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PUB_STATUS_COLORS[row.publicationStatus] ?? "bg-slate-100 text-slate-700"}`}>
                      {dict[`aidPoint.pubStatus.${row.publicationStatus}`] ?? row.publicationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-700">{dict[`aidPoint.status.${row.operationalStatus}`] ?? row.operationalStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(row.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.publicationStatus === "PENDING_REVIEW" ? (
                        <>
                          <button
                            className="min-h-8 rounded-lg border border-[#d7e5d9] bg-[#f4f8f4] px-2.5 py-1 text-xs font-semibold text-[#006233] hover:bg-[#e7f2e9] disabled:opacity-50"
                            disabled={loading === row.id}
                            onClick={() => void applyAction(row.id, "PUBLISH", row.version)}
                            type="button"
                          >
                            {dict["admin.aidPoints.publish"]}
                          </button>
                          <button
                            className="min-h-8 rounded-lg border border-[#f7c9d3] bg-[#fff2f5] px-2.5 py-1 text-xs font-semibold text-[#b91c1c] hover:bg-[#fee2e8] disabled:opacity-50"
                            disabled={loading === row.id}
                            onClick={() => void applyAction(row.id, "REJECT", row.version)}
                            type="button"
                          >
                            {dict["admin.aidPoints.reject"]}
                          </button>
                        </>
                      ) : null}
                      {row.publicationStatus === "PUBLISHED" ? (
                        <button
                          className="min-h-8 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                          disabled={loading === row.id}
                          onClick={() => void applyAction(row.id, "ARCHIVE", row.version)}
                          type="button"
                        >
                          {dict["admin.aidPoints.archive"]}
                        </button>
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
  );
}
