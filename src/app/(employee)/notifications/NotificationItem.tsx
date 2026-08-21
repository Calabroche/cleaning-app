"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types/database";
import { markAsRead } from "./actions";

const borderStyle: Record<AppNotification["type"], string> = {
  urgent: "border-l-warn",
  reminder: "border-l-accent",
  info: "border-l-app-line",
};

export function NotificationItem({ notification }: { notification: AppNotification }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const unread = !notification.read_at;

  function open() {
    if (!unread) return;
    startTransition(async () => {
      await markAsRead(notification.id);
      router.refresh();
    });
  }

  return (
    <div
      onClick={open}
      className={`rounded-tile border-l-4 bg-app-surface p-4 shadow-soft ${borderStyle[notification.type]} ${
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
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="text-xs text-app-faint">
          {new Date(notification.created_at).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isPending && " · Mise à jour..."}
        </p>
        {notification.related_task_id && (
          <Link
            href={`/tasks/${notification.related_task_id}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-lg bg-accent-soft px-2.5 py-1 text-[12px] font-semibold text-accent"
          >
            Ouvrir la tâche
          </Link>
        )}
      </div>
    </div>
  );
}
