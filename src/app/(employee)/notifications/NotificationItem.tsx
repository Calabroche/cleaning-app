"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types/database";
import { markAsRead } from "./actions";

const typeStyle: Record<AppNotification["type"], string> = {
  urgent: "bg-warn-soft",
  reminder: "bg-accent-soft",
  info: "bg-app-surface",
};

export function NotificationItem({ notification }: { notification: AppNotification }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const unread = !notification.read_at;

  return (
    <div
      onClick={() => {
        if (!unread) return;
        startTransition(async () => {
          await markAsRead(notification.id);
          router.refresh();
        });
      }}
      className={`rounded-tile p-4 shadow-soft ${typeStyle[notification.type]} ${
        unread ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] font-semibold">
          {notification.type === "urgent" && "🚨 "}
          {notification.title}
        </p>
        {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
      </div>
      {notification.body && (
        <p className="mt-1.5 text-sm leading-relaxed text-app-body">{notification.body}</p>
      )}
      <p className="mt-2.5 text-xs text-app-faint">
        {new Date(notification.created_at).toLocaleString("fr-FR")}
      </p>
      {isPending && <p className="text-xs text-app-faint">Mise à jour...</p>}
    </div>
  );
}
