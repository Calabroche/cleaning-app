import { requireProfile } from "@/lib/get-profile";
import type { ActivityLog, Profile } from "@/types/database";

type LogWithProfile = ActivityLog & { profiles: Pick<Profile, "full_name" | "email"> | null };

const actionLabel: Record<string, string> = {
  login: "s'est connecté·e",
  task_status_change: "a mis à jour une tâche",
  task_item_toggle: "a coché/décoché un item",
  photo_upload: "a déposé une photo",
  super_admin_force_signout: "a déconnecté de force un compte",
  super_admin_delete_account: "a supprimé un compte",
};

export default async function SuperAdminActivityPage() {
  const { supabase } = await requireProfile();

  const { data: logs } = await supabase
    .from("activity_log")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<LogWithProfile[]>();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold">Activité (200 derniers événements)</h1>
        <p className="text-[13px] text-adm-muted">
          Connexions, actions employé, actions super-admin — tous comptes confondus.
        </p>
      </div>

      <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
        {(!logs || logs.length === 0) && (
          <p className="p-4 text-[13px] text-adm-faint">Aucune activité pour le moment.</p>
        )}
        {logs?.map((log) => (
          <div key={log.id} className="flex items-center justify-between px-4 py-3 text-[13px]">
            <span>
              <span className="font-medium">
                {log.profiles?.full_name || log.profiles?.email || "Compte supprimé"}
              </span>{" "}
              {actionLabel[log.action] ?? log.action}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <span className="ml-2 text-xs text-adm-faint">{JSON.stringify(log.metadata)}</span>
              )}
            </span>
            <span className="shrink-0 text-xs text-adm-faint">
              {new Date(log.created_at).toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
