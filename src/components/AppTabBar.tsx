"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Journée" },
  { href: "/notifications", label: "Messages" },
  { href: "/profile", label: "Profil" },
];

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 px-[18px] pt-3 pb-[22px]">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex h-[52px] flex-1 items-center justify-center rounded-control text-sm font-semibold ${
              active
                ? "bg-app-ink text-app-surface"
                : "bg-app-sunken text-app-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
