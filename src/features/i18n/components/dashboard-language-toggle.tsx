"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";

type Props = {
  currentLocale: AppLocale;
  dict: Record<string, string>;
};

export default function DashboardLanguageToggle({ currentLocale, dict }: Props) {
  const pathname = usePathname();

  const switchLocale = useCallback(async (nextLocale: AppLocale) => {
    if (nextLocale === currentLocale) {
      return;
    }

    // Extract the path after the locale segment
    const pathParts = pathname.split("/");
    const afterLocale = pathParts.slice(2).join("/");
    const newPath = `/${nextLocale}/${afterLocale}`;

    await fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale: nextLocale })
    }).catch(() => null);

    // Navigate to the new locale path
    window.location.href = newPath;
  }, [currentLocale, pathname]);

  return (
    <div className="inline-flex min-h-10 items-center gap-1 rounded-full border border-[#dfe7df] bg-[#f4f8f4] p-1">
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = locale === currentLocale;
        return (
          <button
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition md:text-sm ${
              isActive ? "bg-[#006233] text-white" : "text-slate-700 hover:bg-[#e7f2e9]"
            }`}
            key={locale}
            onClick={() => void switchLocale(locale)}
            type="button"
          >
            {dict[`locale.label.${locale}`] ?? locale}
          </button>
        );
      })}
    </div>
  );
}
