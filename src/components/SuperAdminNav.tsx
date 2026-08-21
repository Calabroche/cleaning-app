"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/super-admin", label: "Vue d'ensemble", exact: true },
  { href: "/super-admin/users", label: "Comptes & sessions" },
  { href: "/super-admin/activity", label: "Activité" },
];

export function SuperAdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2.5 text-[13px] ${
              active
                ? "bg-adm-accent font-semibold text-on-accent-dark"
                : "font-medium text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/admin"
        className="mt-2 rounded-lg px-3 py-2.5 text-[13px] font-medium text-adm-faint hover:bg-adm-hover hover:text-adm-muted"
      >
        ← Vue admin (métier)
      </Link>
      <Link
        href="/dashboard"
        className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-adm-faint hover:bg-adm-hover hover:text-adm-muted"
      >
        ← Vue employé (aperçu)
      </Link>
    </nav>
  );
}
