"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types/database";
import { markAsRead } from "./actions";

const typeStyle: Record<AppNotification["type"], string> = {
  urgent: "border-red-200 bg-red-50",
  reminder: "border-amber-200 bg-amber-50",
  info: "border-neutral-200 bg-white",
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
      className={`rounded-xl border p-4 shadow-sm ${typeStyle[notification.type]} ${
        unread ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {notification.type === "urgent" && "🚨 "}
          {notification.title}
        </p>
        {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
      </div>
      {notification.body && (
        <p className="mt-1 text-sm text-neutral-600">{notification.body}</p>
      )}
      <p className="mt-2 text-xs text-neutral-400">
        {new Date(notification.created_at).toLocaleString("fr-FR")}
      </p>
      {isPending && <p className="text-xs text-neutral-400">Mise à jour...</p>}
    </div>
  );
}
