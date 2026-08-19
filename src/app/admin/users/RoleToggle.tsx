"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRole } from "./actions";

export function RoleToggle({ profileId, role }: { profileId: string; role: "admin" | "employee" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = role === "admin" ? "employee" : "admin";
    startTransition(async () => {
      await setRole(profileId, next);
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
        role === "admin" ? "bg-adm-accent text-on-accent-dark" : "bg-adm-hover text-adm-muted"
      }`}
    >
      {role === "admin" ? "Admin" : "Employé·e"}
    </button>
  );
}
