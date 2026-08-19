"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Vue d'ensemble", exact: true },
  { href: "/admin/planning", label: "Planning" },
  { href: "/admin/apartments", label: "Appartements" },
  { href: "/admin/checklists", label: "Checklists" },
  { href: "/admin/proofs", label: "Preuves" },
  { href: "/admin/users", label: "Équipe" },
  { href: "/admin/notifications", label: "Notifications" },
];

export function AdminNav({ pendingProofs = 0 }: { pendingProofs?: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] ${
              active
                ? "bg-adm-accent font-semibold text-on-accent-dark"
                : "font-medium text-adm-muted hover:bg-adm-hover hover:text-adm-ink"
            }`}
          >
            {item.label}
            {item.href === "/admin/proofs" && pendingProofs > 0 && (
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                  active ? "bg-black/15" : "bg-adm-accent/15 text-adm-accent"
                }`}
              >
                {pendingProofs}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
