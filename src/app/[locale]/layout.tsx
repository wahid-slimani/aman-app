import type { ReactNode } from "react";
import { isSupportedLocale, localeDirection } from "@/i18n/config";
import { notFound } from "next/navigation";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <section lang={locale} dir={localeDirection(locale)}>
      {children}
    </section>
  );
}
