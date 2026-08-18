"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/database";
import { setRole } from "./actions";

export function RoleToggle({ profileId, role }: { profileId: string; role: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next: Role = role === "admin" ? "employee" : "admin";
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
        role === "admin" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {role === "admin" ? "Admin" : "Employé·e"}
    </button>
  );
}
