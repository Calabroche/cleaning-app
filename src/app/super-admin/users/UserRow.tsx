"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types/database";
import { deleteAccount, forceSignOut, setRole } from "./actions";

const roleLabel: Record<Role, string> = {
  employee: "Employé·e",
  admin: "Admin",
  super_admin: "Super admin",
};

export function UserRow({
  userId,
  email,
  fullName,
  role,
  isSelf,
  lastSignInAt,
  createdAt,
}: {
  userId: string;
  email: string;
  fullName: string | null;
  role: Role;
  isSelf: boolean;
  lastSignInAt: string | null;
  createdAt: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSignOut() {
    setError(null);
    startTransition(async () => {
      const res = await forceSignOut(userId);
      if (res?.error) setError(res.error);
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount(userId);
      if (res?.error) {
        setError(res.error);
        setConfirmingDelete(false);
        return;
      }
      router.refresh();
    });
  }

  function handleRoleChange(next: Role) {
    setError(null);
    startTransition(async () => {
      const res = await setRole(userId, next);
      if (res?.error) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{fullName || "Sans nom"}</p>
        <p className="truncate text-xs text-neutral-400">{email}</p>
        <p className="mt-0.5 text-xs text-neutral-400">
          Créé le {new Date(createdAt).toLocaleDateString("fr-FR")} ·{" "}
          {lastSignInAt
            ? `dernière connexion ${new Date(lastSignInAt).toLocaleString("fr-FR")}`
            : "jamais connecté·e"}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          value={role}
          disabled={isSelf || isPending}
          onChange={(e) => handleRoleChange(e.target.value as Role)}
          className="rounded-lg border border-neutral-300 px-2 py-1 text-xs disabled:opacity-50"
        >
          {(Object.keys(roleLabel) as Role[]).map((r) => (
            <option key={r} value={r}>
              {roleLabel[r]}
            </option>
          ))}
        </select>

        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
        >
          Déconnecter
        </button>

        {!isSelf &&
          (confirmingDelete ? (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Confirmer
            </button>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              disabled={isPending}
              className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Supprimer
            </button>
          ))}
      </div>
    </div>
  );
}
