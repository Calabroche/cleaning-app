"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus } from "@/types/database";
import { updateTaskStatus } from "./actions";

const options: { value: TaskStatus; label: string }[] = [
  { value: "in_progress", label: "Commencer" },
  { value: "done", label: "Terminé" },
  { value: "skipped", label: "Reporter" },
];

export function StatusButtons({ taskId, current }: { taskId: string; current: TaskStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(status: TaskStatus) {
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          disabled={isPending || current === opt.value}
          className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium disabled:opacity-40 ${
            current === opt.value
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
