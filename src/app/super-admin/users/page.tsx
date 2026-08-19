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
        <h1 className="text-[15px] font-semibold">Comptes & sessions</h1>
        <p className="text-[13px] text-adm-muted">
          Déconnecter invalide immédiatement toutes les sessions actives du compte. Supprimer
          efface le compte et son historique associé (photos, tâches restent mais sans
          propriétaire).
        </p>
      </div>

      <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
        {(!profiles || profiles.length === 0) && (
          <p className="p-4 text-[13px] text-adm-faint">Aucun compte.</p>
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
