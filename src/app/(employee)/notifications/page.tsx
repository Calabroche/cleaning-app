import { requireProfile } from "@/lib/get-profile";
import type { AppNotification } from "@/types/database";
import { NotificationItem } from "./NotificationItem";

function dayLabel(dateStr: string, today: string, yesterday: string) {
  if (dateStr === today) return "Aujourd'hui";
  if (dateStr === yesterday) return "Hier";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default async function NotificationsPage() {
  const { supabase, profile } = await requireProfile();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .or(`recipient_id.eq.${profile.id},recipient_id.is.null`)
    .order("created_at", { ascending: false })
    .returns<AppNotification[]>();

  const unread = (notifications ?? []).filter((n) => !n.read_at).length;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);

  const groups = (notifications ?? []).reduce<{ label: string; items: AppNotification[] }[]>(
    (acc, n) => {
      const label = dayLabel(n.created_at.slice(0, 10), today, yesterday);
      const group = acc.find((g) => g.label === label);
      if (group) group.items.push(n);
      else acc.push({ label, items: [n] });
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-col px-[18px] pt-6 pb-4">
      <h1 className="text-[22px] font-semibold leading-tight">Messages</h1>
      <p className="mb-5 mt-1 text-sm text-app-muted">
        {unread > 0 ? `${unread} non lu${unread > 1 ? "s" : ""}` : "Tout est lu"}
      </p>

      {(!notifications || notifications.length === 0) && (
        <p className="rounded-card bg-app-sunken p-6 text-center text-[15px] text-app-muted">
          Aucun message pour le moment.
        </p>
      )}

      {groups.map((group) => (
        <div key={group.label} className="mb-5">
          <h2 className="mb-2.5 text-sm font-medium text-app-muted">{group.label}</h2>
          <div className="flex flex-col gap-2.5">
            {group.items.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
