"use client";

import { useState } from "react";

type Props = {
  labelLogout: string;
  labelLoggingOut: string;
};

export default function LogoutButton({ labelLogout, labelLoggingOut }: Props) {
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.replace("/ar-DZ/login");
    }
  }

  return (
    <button
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d7e5d9] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-[#f4f8f4] disabled:opacity-50"
      disabled={loading}
      onClick={() => void onLogout()}
      type="button"
    >
      <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
      {loading ? labelLoggingOut : labelLogout}
    </button>
  );
}
