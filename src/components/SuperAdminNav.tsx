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
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/admin"
        className="mt-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
      >
        ← Vue admin (métier)
      </Link>
    </nav>
  );
}
