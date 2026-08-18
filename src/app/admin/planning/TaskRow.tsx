"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Apartment, Profile, Task } from "@/types/database";
import { deleteTask } from "./actions";

const statusLabel: Record<Task["status"], string> = {
  pending: "À faire",
  in_progress: "En cours",
  done: "Terminé",
  skipped: "Reporté",
};

export function TaskRow({
  task,
  apartment,
  employee,
}: {
  task: Task;
  apartment: Apartment | null;
  employee: Profile | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <div>
        <p className="font-medium">
          {task.is_urgent && <span className="text-red-500">⚠ </span>}
          {apartment?.name ?? "Appartement supprimé"} — {employee?.full_name || employee?.email || "Non assigné"}
        </p>
        <p className="text-xs text-neutral-400">
          {task.scheduled_date} · {statusLabel[task.status]}
        </p>
      </div>
      <button
        onClick={() =>
          startTransition(async () => {
            await deleteTask(task.id);
            router.refresh();
          })
        }
        disabled={isPending}
        className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}
