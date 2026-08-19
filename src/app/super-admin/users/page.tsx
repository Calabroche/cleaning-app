import { requireProfile } from "@/lib/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database";
import { UserRow } from "./UserRow";

export default async function SuperAdminUsersPage() {
  const { supabase, profile: me } = await requireProfile();

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).returns<Profile[]>(),
    createAdminClient().auth.admin.listUsers({ perPage: 200 }),
  ]);

  const lastSignInByUserId = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.last_sign_in_at])
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Comptes & sessions</h1>
        <p className="text-sm text-neutral-500">
          Déconnecter invalide immédiatement toutes les sessions actives du compte. Supprimer
          efface le compte et son historique associé (photos, tâches restent mais sans
          propriétaire).
        </p>
      </div>

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
        {(!profiles || profiles.length === 0) && (
          <p className="p-4 text-sm text-neutral-400">Aucun compte.</p>
        )}
        {profiles?.map((p) => (
          <UserRow
            key={p.id}
            userId={p.id}
            email={p.email}
            fullName={p.full_name}
            role={p.role}
            isSelf={p.id === me.id}
            lastSignInAt={lastSignInByUserId.get(p.id) ?? null}
            createdAt={p.created_at}
          />
        ))}
      </div>
    </div>
  );
}
