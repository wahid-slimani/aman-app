"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isSupportedLocale, localeDirection } from "@/i18n/config";

export default function LocalizedNotFoundPage() {
  const pathname = usePathname();
  const [, maybeLocale] = pathname.split("/");
  const locale = isSupportedLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <main className="relative min-h-[70dvh] overflow-hidden bg-[#f7f9f7] p-4 sm:p-8" dir={localeDirection(locale)} lang={locale}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-[#d6ebda] blur-3xl" />
        <div className="absolute right-[-4rem] bottom-[-6rem] h-80 w-80 rounded-full bg-[#e7f2e9] blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl border border-[#dfe7df] bg-white/90 px-6 py-10 text-center shadow-[0_20px_60px_-30px_rgba(0,98,51,0.35)] backdrop-blur sm:px-10 sm:py-14">
        <span className="inline-flex rounded-full border border-[#cce3d3] bg-[#f1f8f3] px-4 py-1 text-xs font-semibold tracking-[0.18em] text-[#006233]">
          404
        </span>

        <h1 className="mt-5 text-2xl font-black tracking-tight text-[#006233] sm:text-4xl">
          {dict["common.notFound.title"]}
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
          {dict["common.notFound.body"]}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#006233] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00512a]" href={`/${locale}`}>
            {dict["common.notFound.goHome"]}
          </Link>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d7e5d9] bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f4f8f4]" href={`/${locale}/login`}>
            {dict["common.notFound.goLogin"]}
          </Link>
        </div>
      </section>
    </main>
  );
}
