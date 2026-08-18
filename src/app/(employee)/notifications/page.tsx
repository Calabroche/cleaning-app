import { requireProfile } from "@/lib/get-profile";
import type { AppNotification } from "@/types/database";
import { NotificationItem } from "./NotificationItem";

export default async function NotificationsPage() {
  const { supabase, profile } = await requireProfile();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`recipient_id.eq.${profile.id},recipient_id.is.null`)
    .order("created_at", { ascending: false })
    .returns<AppNotification[]>();

  return (
    <div className="mx-auto max-w-lg space-y-3 px-4 py-4">
      <h1 className="mb-1 text-lg font-semibold">Notifications</h1>

      {(!notifications || notifications.length === 0) && (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
          Aucune notification.
        </p>
      )}

      {notifications?.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
