"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { finishTask } from "./actions";

export function FinishButton({ taskId, remaining }: { taskId: string; remaining: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const blocked = remaining > 0;

  return (
    <button
      type="button"
      disabled={blocked || isPending}
      onClick={() =>
        startTransition(async () => {
          await finishTask(taskId);
          router.push("/dashboard");
        })
      }
      className={`h-[60px] w-full rounded-control text-[17px] font-semibold ${
        blocked ? "bg-app-track text-app-faint" : "bg-accent text-white"
      }`}
    >
      {blocked ? `Encore ${remaining} item${remaining > 1 ? "s" : ""}` : "Terminer le ménage"}
    </button>
  );
}
