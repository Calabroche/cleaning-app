"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Apartment, PhotoKind, Profile, Task, TaskItem, TaskPhoto } from "@/types/database";
import { requestRedo, validateTask } from "./actions";

type ProofTask = Task & {
  apartments: Pick<Apartment, "name"> | null;
  profiles: Pick<Profile, "full_name" | "email"> | null;
  task_items: Pick<TaskItem, "id" | "room" | "label" | "photo_requirement">[];
};

export function ProofCard({
  task,
  photos,
}: {
  task: ProofTask;
  photos: (TaskPhoto & { url: string | null })[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");

  const documented = task.task_items.filter((i) => i.photo_requirement !== "none");

  return (
    <article className="overflow-hidden rounded-xl bg-adm-surface">
      <header className="flex items-center gap-3.5 border-b border-white/[0.06] px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-adm-raised text-xs font-semibold">
          {(task.profiles?.full_name ?? task.profiles?.email ?? "??").slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {task.apartments?.name} — {task.profiles?.full_name || task.profiles?.email}
          </p>
          <p className="mt-0.5 text-xs text-adm-muted">
            Terminé le {new Date(task.updated_at).toLocaleString("fr-FR")} · {task.task_items.length} items ·{" "}
            {photos.length} photos
          </p>
        </div>
        <span className="rounded-md bg-adm-accent/15 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.06em] text-adm-accent">
          À VALIDER
        </span>
      </header>

      <div className="grid grid-cols-4 gap-3.5 px-5 py-[18px]">
        {documented.map((item) => (
          <div key={item.id}>
            <p className="mb-2 text-label font-semibold tracking-label text-adm-muted">
              {item.room.toUpperCase()} — {item.label.toUpperCase()}
            </p>
            <div className="flex gap-2">
              {(["before", "after"] as PhotoKind[]).map((kind) => {
                const photo = photos.find((p) => p.task_item_id === item.id && p.kind === kind);
                if (!photo && kind === "before" && item.photo_requirement === "after") return null;
                return (
                  <div
                    key={kind}
                    className="flex aspect-square flex-1 items-end justify-center rounded-lg bg-adm-raised bg-cover bg-center pb-1.5 text-[8px] font-mono text-adm-faint"
                    style={photo?.url ? { backgroundImage: `url(${photo.url})` } : undefined}
                  >
                    {photo?.url ? "" : kind === "before" ? "avant" : "après"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-4">
        {asking ? (
          <>
            <input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ce qui doit être refait…"
              className="flex-1 rounded-lg bg-adm-hover px-3 py-2 text-[13px] outline-none placeholder:text-adm-faint"
            />
            <button
              type="button"
              disabled={!reason || isPending}
              onClick={() =>
                startTransition(async () => {
                  await requestRedo(task.id, reason);
                  setAsking(false);
                  router.refresh();
                })
              }
              className="h-9 rounded-lg bg-warn-dark px-4 text-[13px] font-semibold text-adm-bg disabled:opacity-50"
            >
              Envoyer la demande
            </button>
          </>
        ) : (
          <>
            <p className="flex-1 text-xs text-adm-muted">
              {task.task_items.length - documented.length} items sans photo exigée
            </p>
            <button
              type="button"
              onClick={() => setAsking(true)}
              className="h-9 rounded-lg bg-adm-raised px-4 text-[13px] font-semibold text-warn-dark hover:bg-adm-hover"
            >
              Demander une reprise
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await validateTask(task.id);
                  router.refresh();
                })
              }
              className="h-9 rounded-lg bg-adm-accent px-4.5 text-[13px] font-semibold text-on-accent-dark disabled:opacity-50"
            >
              Valider le ménage
            </button>
          </>
        )}
      </footer>
    </article>
  );
}
