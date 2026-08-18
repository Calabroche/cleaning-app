import { requireProfile } from "@/lib/get-profile";
import type { ActivityLog, Profile } from "@/types/database";

type LogWithProfile = ActivityLog & { profiles: Pick<Profile, "full_name" | "email"> | null };

const actionLabel: Record<string, string> = {
  login: "s'est connecté·e",
  task_status_change: "a mis à jour une tâche",
  photo_upload: "a déposé une photo",
};

export default async function AdminOverviewPage() {
  const { supabase } = await requireProfile();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [{ count: todayCount }, { count: urgentCount }, { count: employeeCount }, { data: logs }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("scheduled_date", todayStr),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("is_urgent", true)
        .neq("status", "done"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employee"),
      supabase
        .from("activity_log")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<LogWithProfile[]>(),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Vue d&apos;ensemble</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{todayCount ?? 0}</p>
          <p className="text-sm text-neutral-500">Tâches aujourd&apos;hui</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold text-red-600">{urgentCount ?? 0}</p>
          <p className="text-sm text-neutral-500">Urgences en cours</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-2xl font-semibold">{employeeCount ?? 0}</p>
          <p className="text-sm text-neutral-500">Employés</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Activité récente</h2>
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
          {(!logs || logs.length === 0) && (
            <p className="p-4 text-sm text-neutral-400">Aucune activité pour le moment.</p>
          )}
          {logs?.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                <span className="font-medium">
                  {log.profiles?.full_name || log.profiles?.email || "Quelqu'un"}
                </span>{" "}
                {actionLabel[log.action] ?? log.action}
              </span>
              <span className="text-xs text-neutral-400">
                {new Date(log.created_at).toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
