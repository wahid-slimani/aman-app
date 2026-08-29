import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/i18n/dictionaries";
import { localeDirection, SUPPORTED_LOCALES } from "@/i18n/config";
import type { AppLocale } from "@/i18n/config";
import AdminNav from "@/features/admin/components/admin-nav";
import LogoutButton from "@/features/authentication/components/logout-button";
import DashboardLanguageToggle from "@/features/i18n/components/dashboard-language-toggle";
import logo from "@/assets/logo.png";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
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
function UsersIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}
function DatabaseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
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
function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const resolvedLocale = locale as AppLocale;
  if (!SUPPORTED_LOCALES.includes(resolvedLocale)) {
    throw new Error(`Invalid locale: ${resolvedLocale}`);
  }

  const dict = getDictionary(resolvedLocale);

  const navItems = [
    { href: `/${resolvedLocale}/admin`, label: dict["nav.overview"], icon: <GridIcon />, exact: true },
    { href: `/${resolvedLocale}/admin/aid-points`, label: dict["nav.aidPoints"], icon: <PinIcon /> },
    { href: `/${resolvedLocale}/admin/organisers`, label: dict["nav.organisers"], icon: <UsersIcon /> },
    { href: `/${resolvedLocale}/admin/reports`, label: dict["nav.reports"], icon: <FlagIcon /> },
    { href: `/${resolvedLocale}/admin/dataset`, label: dict["nav.dataset"], icon: <DatabaseIcon /> },
    { href: `/${resolvedLocale}/admin/analytics`, label: dict["nav.analytics"], icon: <ChartIcon /> },
    { href: `/${resolvedLocale}/admin/audit`, label: dict["nav.audit"], icon: <ShieldIcon /> },
  ];

  return (
    <div className="min-h-dvh bg-[#f7f9f7]" dir={localeDirection(resolvedLocale)} id="admin-shell" lang={resolvedLocale}>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#dfe7df] bg-white px-4 shadow-sm md:px-6">
        <Link className="flex items-center gap-2 font-semibold text-[#006233]" href={`/${resolvedLocale}/admin`}>
          <Image alt={dict["app.title"]} className="h-8 w-8 rounded-md border border-[#dfe7df] bg-white p-0.5" priority src={logo} />
          <span className="hidden md:inline">{dict["nav.adminBrand"]}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-[#d7e5d9] px-3 py-1.5 text-sm font-semibold text-[#006233] hover:bg-[#f4f8f4]" href={`/${resolvedLocale}`}>
            {dict["nav.home"]}
          </Link>
          <DashboardLanguageToggle currentLocale={resolvedLocale} dict={dict} />
          <LogoutButton labelLogout={dict["nav.logout"]} labelLoggingOut={dict["nav.loggingOut"]} />
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-[#dfe7df] bg-white px-3 py-4 md:block">
          <AdminNav ariaLabel={dict["nav.adminNavigation"]} items={navItems} />
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
