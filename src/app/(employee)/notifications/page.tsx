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
    <div className="flex flex-col gap-2.5 px-[18px] pt-6 pb-4">
      <h1 className="mb-2 text-[22px] font-semibold leading-tight">Messages</h1>

      {(!notifications || notifications.length === 0) && (
        <p className="rounded-card bg-app-sunken p-6 text-center text-[15px] text-app-muted">
          Aucun message pour le moment.
        </p>
      )}

      {notifications?.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </div>
  );
}
