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
      <h1 className="text-lg font-semibold">Notifications</h1>

      <SendNotificationForm employees={employees ?? []} />

      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white shadow-sm">
        {(!notifications || notifications.length === 0) && (
          <p className="p-4 text-sm text-neutral-400">Aucune notification envoyée.</p>
        )}
        {notifications?.map((n) => (
          <div key={n.id} className="px-4 py-3 text-sm">
            <p className="font-medium">
              {n.type === "urgent" && "🚨 "}
              {n.title}{" "}
              <span className="font-normal text-neutral-400">
                → {n.recipient_id ? employeeById.get(n.recipient_id)?.full_name ?? "?" : "tout le monde"}
              </span>
            </p>
            {n.body && <p className="text-neutral-500">{n.body}</p>}
            <p className="mt-1 text-xs text-neutral-400">
              {new Date(n.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
