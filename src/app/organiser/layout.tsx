import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/i18n/dictionaries";
import { localeDirection } from "@/i18n/config";
import OrganiserNav from "@/features/organiser/components/organiser-nav";
import LogoutButton from "@/features/authentication/components/logout-button";
import DashboardLanguageToggle from "@/features/i18n/components/dashboard-language-toggle";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import logo from "@/assets/logo.png";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

type OrganiserLayoutProps = {
  children: ReactNode;
};

function GridIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="7" rx="1" width="7" x="3" y="3" /><rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="14" /><rect height="7" rx="1" width="7" x="3" y="14" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

export default async function OrganiserLayout({ children }: OrganiserLayoutProps) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  const navItems = [
    { href: "/organiser", label: dict["nav.overview"], icon: <GridIcon />, exact: true },
    { href: "/organiser/aid-points", label: dict["nav.aidPoints"], icon: <PinIcon /> },
    { href: "/organiser/analytics", label: dict["nav.analytics"], icon: <ChartIcon /> },
  ];

  return (
    <div className="min-h-dvh bg-[#f7f9f7]" dir={localeDirection(locale)} id="organiser-shell" lang={locale}>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#dfe7df] bg-white px-4 shadow-sm md:px-6">
        <Link className="flex items-center gap-2 font-semibold text-[#006233]" href="/organiser">
          <Image alt={dict["app.title"]} className="h-8 w-8 rounded-md border border-[#dfe7df] bg-white p-0.5" priority src={logo} />
          <span className="hidden md:inline">{dict["nav.organiserBrand"]}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-[#d7e5d9] px-3 py-1.5 text-sm font-semibold text-[#006233] hover:bg-[#f4f8f4]" href={`/${locale}`}>
            {dict["nav.home"]}
          </Link>
          <DashboardLanguageToggle currentLocale={locale} dict={dict} />
          <LogoutButton labelLogout={dict["nav.logout"]} labelLoggingOut={dict["nav.loggingOut"]} />
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-[#dfe7df] bg-white px-3 py-4 md:block">
          <OrganiserNav ariaLabel={dict["nav.organiserNavigation"]} items={navItems} />
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
