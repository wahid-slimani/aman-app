"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

type Status = "OPEN" | "TEMPORARILY_CLOSED" | "FULL" | "NEEDS_VERIFICATION";

type Props = {
  pointId: string;
  pointTitle: string;
  currentStatus: string;
  version: number;
  dict: Record<string, string>;
  onClose: () => void;
  onSuccess: (newStatus: string, newVersion: number) => void;
};

const STATUSES: Status[] = ["OPEN", "TEMPORARILY_CLOSED", "FULL", "NEEDS_VERIFICATION"];

export default function QuickStatusModal({ pointId, pointTitle, currentStatus, version, dict, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<Status>(currentStatus as Status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onApply() {
    if (selected === currentStatus) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authenticatedFetch(`/api/organiser/aid-points/${pointId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedVersion: version, operationalStatus: selected })
      });
      const payload = (await res.json()) as { success: boolean; data?: { version: number }; error?: { message: string } };
      if (!payload.success) throw new Error(payload.error?.message ?? dict["common.error"]);
      onSuccess(selected, payload.data?.version ?? version + 1);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-[#dfe7df] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-[#006233]">{dict["organiser.quickStatusTitle"]}</h2>
        <p className="mt-1 text-sm text-slate-600 line-clamp-1">{pointTitle}</p>

        <div className="mt-4 grid gap-2">
          {STATUSES.map((s) => (
            <button
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition ${selected === s ? "border-[#006233] bg-[#f4f8f4] text-[#006233]" : "border-[#d7e5d9] text-slate-700 hover:bg-slate-50"}`}
              key={s}
              onClick={() => setSelected(s)}
              type="button"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${s === "OPEN" ? "bg-[#006233]" : s === "TEMPORARILY_CLOSED" ? "bg-amber-500" : s === "FULL" ? "bg-slate-500" : "bg-[#d21034]"}`} />
              {dict[`aidPoint.status.${s}`] ?? s}
            </button>
          ))}
        </div>

        {error ? <p className="mt-3 text-sm text-[#b91c1c]">{error}</p> : null}

        <div className="mt-4 flex gap-2">
          <button
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#006233] text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            onClick={() => void onApply()}
            type="button"
          >
            {loading ? dict["form.saving"] : dict["common.save"]}
          </button>
          <button
            className="min-h-11 rounded-xl border border-[#d7e5d9] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            {dict["form.close"]}
          </button>
        </div>
      </div>
    </div>
  );
}
