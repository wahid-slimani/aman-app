"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

type Props = {
  dict: Record<string, string>;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateOrganiserModal({ dict, onClose, onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await authenticatedFetch("/api/admin/organisers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password, displayName, organisationName: organisationName || undefined })
      });
      const payload = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!payload.success) throw new Error(payload.error?.message ?? dict["common.error"]);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#dceedd]";
  const labelCls = "block text-xs font-semibold text-slate-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-[#dfe7df] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-[#006233]">{dict["admin.createOrganiserTitle"]}</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className={labelCls}>{dict["auth.username"]} *</label>
            <input className={inputCls} onChange={(e) => setUsername(e.target.value)} value={username} />
          </div>
          <div>
            <label className={labelCls}>{dict["admin.organiser.password"]} *</label>
            <input className={inputCls} onChange={(e) => setPassword(e.target.value)} type="password" value={password} />
          </div>
          <div>
            <label className={labelCls}>{dict["admin.organiser.displayName"]} *</label>
            <input className={inputCls} onChange={(e) => setDisplayName(e.target.value)} value={displayName} />
          </div>
          <div>
            <label className={labelCls}>{dict["admin.organiser.organisationName"]}</label>
            <input className={inputCls} onChange={(e) => setOrganisationName(e.target.value)} value={organisationName} />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-[#b91c1c]">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <button
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#006233] text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            onClick={() => void onSubmit()}
            type="button"
          >
            {loading ? dict["form.creating"] : dict["form.create"]}
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
