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
      <h1 className="text-[15px] font-semibold">
        Équipe <span className="font-normal text-adm-faint">· {profiles?.length ?? 0} membres</span>
      </h1>

      <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
        {(!profiles || profiles.length === 0) && (
          <p className="p-4 text-[13px] text-adm-faint">Aucun membre pour le moment.</p>
        )}
        {profiles?.map((p) => {
          const lastLogin = lastLoginByProfile.get(p.id);
          return (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[13px] font-medium">
                  {p.full_name || "Sans nom"}
                  {p.id === me.id && <span className="ml-1.5 text-adm-faint">· toi</span>}
                </p>
                <p className="text-xs text-adm-faint">{p.email}</p>
                <p className="mt-0.5 text-xs text-adm-faint">
                  {lastLogin
                    ? `Dernière connexion : ${new Date(lastLogin).toLocaleString("fr-FR")}`
                    : "Jamais connecté·e"}
                </p>
              </div>
              {p.role === "super_admin" ? (
                <span className="rounded-full bg-adm-hover px-2.5 py-1 text-xs font-medium text-adm-muted">
                  Super admin
                </span>
              ) : p.id === me.id ? (
                <span className="text-xs text-adm-faint">Toi</span>
              ) : (
                <RoleToggle profileId={p.id} role={p.role} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-adm-faint">
        Le rôle admin donne accès à cet espace web uniquement — les apps mobiles restent l&apos;app
        intervenant.
      </p>
    </div>
  );
}
