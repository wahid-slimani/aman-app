"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/lib/api/authenticated-fetch";

type Props = {
  userId: string;
  username: string;
  dict: Record<string, string>;
  onClose: () => void;
};

export default function ResetPasswordModal({ userId, username, dict, onClose }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    if (!window.confirm(dict["admin.resetPasswordConfirm"])) return;
    setLoading(true);
    setError("");

    try {
      const res = await authenticatedFetch(`/api/admin/organisers/${userId}/reset-password`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ newPassword })
      });
      const payload = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!payload.success) throw new Error(payload.error?.message ?? dict["common.error"]);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict["common.error"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-[#dfe7df] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-[#006233]">{dict["admin.resetPasswordTitle"]}</h2>
        <p className="mt-1 text-sm text-slate-600">{username}</p>

        {success ? (
          <p className="mt-4 rounded-xl border border-[#d7e5d9] bg-[#f4f8f4] px-4 py-3 text-sm text-[#006233]">{dict["admin.resetPasswordSuccess"]}</p>
        ) : (
          <>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">{dict["admin.organiser.password"]} *</label>
              <input
                className="min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 text-sm outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#dceedd]"
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                value={newPassword}
              />
            </div>
            {error ? <p className="mt-3 text-sm text-[#b91c1c]">{error}</p> : null}
            <div className="mt-4 flex gap-2">
              <button
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#d21034] text-sm font-semibold text-white disabled:opacity-60"
                disabled={loading || newPassword.length < 8}
                onClick={() => void onSubmit()}
                type="button"
              >
                {loading ? dict["form.saving"] : dict["admin.resetPassword"]}
              </button>
              <button
                className="min-h-11 rounded-xl border border-[#d7e5d9] px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={onClose}
                type="button"
              >
                {dict["form.close"]}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
