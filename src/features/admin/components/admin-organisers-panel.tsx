"use client";

import { useState } from "react";
import CreateOrganiserModal from "@/features/admin/components/create-organiser-modal";
import ResetPasswordModal from "@/features/admin/components/reset-password-modal";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

type Row = {
  id: string;
  profileId: string;
  username: string;
  displayName: string;
  organisationName: string | null;
  status: string;
  aidPointCount: number;
  lastLoginAt: string | null;
  createdAt: string;
};

type Props = {
  dict: Record<string, string>;
  rows: Row[];
};

export default function AdminOrganisersPanel({ dict, rows }: Props) {
  const [items, setItems] = useState(rows);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; username: string } | null>(null);

  async function refreshOrganisers() {
    try {
      const response = await authenticatedFetch("/api/admin/organisers", { cache: "no-store" });
      const payload = (await response.json()) as {
        success: boolean;
        data?: Array<{
          id: string;
          displayName: string;
          organisationName: string | null;
          createdAt: string;
          user: { id: string; username: string; status: string; lastLoginAt: string | null; createdAt: string };
          aidPoints: Array<{ id: string }>;
        }>;
        error?: { message?: string };
      };

      if (!payload.success) {
        throw new Error(payload.error?.message ?? dict["common.error"]);
      }

      const nextRows = (payload.data ?? []).map((o) => ({
        id: o.user.id,
        profileId: o.id,
        username: o.user.username,
        displayName: o.displayName,
        organisationName: o.organisationName,
        status: o.user.status,
        aidPointCount: o.aidPoints.length,
        lastLoginAt: o.user.lastLoginAt,
        createdAt: o.user.createdAt
      }));

      setItems(nextRows);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : dict["common.error"]);
    }
  }

  async function toggleBlock(userId: string, currentStatus: string) {
    const isBlocking = currentStatus !== "BLOCKED";
    const msg = isBlocking ? dict["admin.organisers.blockConfirm"] : dict["admin.organisers.unblockConfirm"];
    if (!window.confirm(msg)) return;

    setLoading(userId);
    setError("");

    try {
      if (isBlocking) {
        const res = await authenticatedFetch(`/api/admin/organisers/${userId}/block`, { method: "POST" });
        if (!res.ok) throw new Error();
        setItems((prev) => prev.map((r) => (r.id === userId ? { ...r, status: "BLOCKED" } : r)));
      } else {
        const res = await authenticatedFetch(`/api/admin/organisers/${userId}/unblock`, { method: "POST" });
        if (!res.ok) throw new Error();
        setItems((prev) => prev.map((r) => (r.id === userId ? { ...r, status: "ACTIVE" } : r)));
      }
    } catch {
      setError(dict["common.error"]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {showCreate ? (
        <CreateOrganiserModal
          dict={dict}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            void refreshOrganisers();
          }}
        />
      ) : null}
      {resetTarget ? (
        <ResetPasswordModal
          dict={dict}
          onClose={() => setResetTarget(null)}
          userId={resetTarget.id}
          username={resetTarget.username}
        />
      ) : null}

      <div className="mb-3 flex">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#006233] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00512a]"
          onClick={() => setShowCreate(true)}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {dict["admin.createOrganiser"]}
        </button>
      </div>

      <article className="rounded-2xl border border-[#dfe7df] bg-white shadow-sm">
        {error ? <p className="px-5 pt-4 text-sm text-[#b91c1c]">{error}</p> : null}
        {items.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">{dict["admin.organisers.empty"]}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dfe7df] text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">{dict["admin.organisers.displayName"]}</th>
                <th className="px-4 py-3">{dict["admin.organisers.username"]}</th>
                <th className="px-4 py-3">{dict["admin.organisers.aidPointsCount"]}</th>
                <th className="px-4 py-3">{dict["admin.organisers.lastLogin"]}</th>
                <th className="px-4 py-3">{dict["admin.organisers.created"]}</th>
                <th className="px-4 py-3">{dict["common.actions"]}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr className="border-b border-[#f0f5f0] last:border-0" key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{row.displayName}</p>
                    {row.organisationName ? <p className="text-xs text-slate-500">{row.organisationName}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.username}</td>
                  <td className="px-4 py-3 text-slate-700">{row.aidPointCount}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : dict["common.never"]}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(row.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.status === "ACTIVE"
                            ? "bg-[#e7f2e9] text-[#006233]"
                            : "bg-[#fff2f5] text-[#b91c1c]"
                        }`}
                      >
                        {row.status === "ACTIVE" ? dict["admin.organisers.active"] : dict["admin.organisers.blocked"]}
                      </span>
                      <button
                        className={`inline-flex min-h-8 items-center rounded-lg border px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                          row.status === "ACTIVE"
                            ? "border-[#f7c9d3] bg-[#fff2f5] text-[#b91c1c] hover:bg-[#fee2e8]"
                            : "border-[#d7e5d9] bg-[#f4f8f4] text-[#006233] hover:bg-[#e7f2e9]"
                        }`}
                        disabled={loading === row.id}
                        onClick={() => void toggleBlock(row.id, row.status)}
                        type="button"
                      >
                        {row.status === "ACTIVE" ? dict["admin.organisers.block"] : dict["admin.organisers.unblock"]}
                      </button>
                      <button
                          className="inline-flex min-h-8 items-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                          onClick={() => setResetTarget({ id: row.id, username: row.username })}
                          type="button"
                        >
                          {dict["admin.resetPassword"]}
                        </button>
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
