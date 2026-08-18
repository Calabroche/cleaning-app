import { requireProfile } from "@/lib/get-profile";
import type { ActivityLog, Profile } from "@/types/database";
import { RoleToggle } from "./RoleToggle";

export default async function AdminUsersPage() {
  const { supabase, profile: me } = await requireProfile();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true })
    .returns<Profile[]>();

  const { data: lastLogins } = await supabase
    .from("activity_log")
    .select("*")
    .eq("action", "login")
    .order("created_at", { ascending: false })
    .returns<ActivityLog[]>();

  const lastLoginByProfile = new Map<string, string>();
  for (const log of lastLogins ?? []) {
    if (log.profile_id && !lastLoginByProfile.has(log.profile_id)) {
      lastLoginByProfile.set(log.profile_id, log.created_at);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Équipe</h1>

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
        {(!profiles || profiles.length === 0) && (
          <p className="p-4 text-sm text-neutral-400">Aucun membre pour le moment.</p>
        )}
        {profiles?.map((p) => {
          const lastLogin = lastLoginByProfile.get(p.id);
          return (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{p.full_name || "Sans nom"}</p>
                <p className="text-xs text-neutral-400">{p.email}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {lastLogin
                    ? `Dernière connexion : ${new Date(lastLogin).toLocaleString("fr-FR")}`
                    : "Jamais connecté·e"}
                </p>
              </div>
              {p.id === me.id ? (
                <span className="text-xs text-neutral-400">Toi</span>
              ) : (
                <RoleToggle profileId={p.id} role={p.role} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
