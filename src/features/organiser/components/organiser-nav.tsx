"use client";

import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
};

type Props = {
  items: NavItem[];
  ariaLabel: string;
};

export default function OrganiserNav({ items, ariaLabel }: Props) {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) {
      return pathname === href || pathname === `${href}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav aria-label={ariaLabel}>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <a
              aria-current={isActive(item.href, item.exact) ? "page" : undefined}
              className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive(item.href, item.exact)
                  ? "bg-[#006233] text-white"
                  : "text-slate-700 hover:bg-[#e7f2e9] hover:text-[#006233]"
              }`}
              href={item.href}
            >
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
