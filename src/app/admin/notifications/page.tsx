import { requireProfile } from "@/lib/get-profile";
import type { AppNotification, Profile } from "@/types/database";
import { SendNotificationForm } from "./SendNotificationForm";

export default async function AdminNotificationsPage() {
  const { supabase } = await requireProfile();

  const [{ data: employees }, { data: notifications }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "employee").returns<Profile[]>(),
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<AppNotification[]>(),
  ]);

  const employeeById = new Map((employees ?? []).map((e) => [e.id, e]));

  return (
    <div className="space-y-6">
      <h1 className="text-[15px] font-semibold">Notifications</h1>

      <SendNotificationForm employees={employees ?? []} />

      <div className="divide-y divide-white/[0.06] rounded-xl bg-adm-surface">
        {(!notifications || notifications.length === 0) && (
          <p className="p-4 text-[13px] text-adm-faint">Aucune notification envoyée.</p>
        )}
        {notifications?.map((n) => (
          <div key={n.id} className="px-4 py-3 text-[13px]">
            <p className="font-medium">
              {n.type === "urgent" && "🚨 "}
              {n.title}{" "}
              <span className="font-normal text-adm-faint">
                → {n.recipient_id ? employeeById.get(n.recipient_id)?.full_name ?? "?" : "tout le monde"}
              </span>
            </p>
            {n.body && <p className="text-adm-muted">{n.body}</p>}
            <p className="mt-1 text-xs text-adm-faint">
              {new Date(n.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
