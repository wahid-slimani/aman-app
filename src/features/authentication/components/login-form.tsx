"use client";

import { FormEvent, useEffect, useState } from "react";

type Props = {
  locale: string;
  dict: Record<string, string>;
};

type LoginSuccessPayload = {
  success: true;
  data: {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "ORGANISER";
    };
  };
};

type LoginErrorPayload = {
  success: false;
  error?: {
    message?: string;
  };
};

export default function LoginForm({ locale, dict }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale })
    }).catch(() => null);
  }, [locale]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept-language": locale
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const failed = (await response.json().catch(() => null)) as LoginErrorPayload | null;
        setError(failed?.error?.message ?? dict["common.error"]);
        return;
      }

      const payload = (await response.json()) as LoginSuccessPayload;
      const dashboardPath = payload.data.user.role === "SUPER_ADMIN" ? `/admin` : `/organiser`;
      const target = `/${locale}${dashboardPath}`;
      window.location.replace(target);
    } catch {
      setError(dict["common.networkError"]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-3 text-start" onSubmit={onSubmit}>
      <input
        aria-label={dict["auth.username"]}
        className="min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#dceedd]"
        onChange={(event) => setUsername(event.target.value)}
        placeholder={dict["auth.username"]}
        value={username}
      />
      <input
        aria-label={dict["auth.password"]}
        className="min-h-11 w-full rounded-xl border border-[#d7e5d9] bg-white px-3 py-2 outline-none focus:border-[#006233] focus:ring-2 focus:ring-[#dceedd]"
        onChange={(event) => setPassword(event.target.value)}
        placeholder={dict["auth.password"]}
        type="password"
        value={password}
      />
      {error ? <p className="text-sm text-[#b91c1c]">{error}</p> : null}
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#006233] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? dict["auth.loginSubmitting"] : dict["auth.loginAction"]}
      </button>
    </form>
  );
}
