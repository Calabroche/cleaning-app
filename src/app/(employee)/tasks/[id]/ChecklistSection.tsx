"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PhotoKind, TaskItem, TaskPhoto } from "@/types/database";
import { toggleTaskItem } from "./actions";

type ItemWithPhotos = TaskItem & { photos: (TaskPhoto & { url: string | null })[] };

const requirementLabel: Record<TaskItem["photo_requirement"], string | null> = {
  none: null,
  after: "Photo",
  before_after: "Photo",
};

export function ChecklistSection({
  room,
  items,
  taskId,
}: {
  room: string;
  items: ItemWithPhotos[];
  taskId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const done = items.filter((i) => i.done_at).length;

  function toggle(item: ItemWithPhotos) {
    startTransition(async () => {
      await toggleTaskItem(item.id, taskId, !item.done_at);
      router.refresh();
    });
  }

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-[15px] font-medium text-app-muted">
        {room} · {done}/{items.length}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isDone = Boolean(item.done_at);
          const needsPhoto = item.photo_requirement !== "none";
          const byKind = (kind: PhotoKind) => item.photos.filter((p) => p.kind === kind);

          return (
            <li
              key={item.id}
              className={`rounded-tile px-[18px] py-4 ${
                isDone ? "bg-app-sunken" : "bg-app-surface shadow-lift"
              }`}
            >
              <div className="flex min-h-8 items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  disabled={isPending}
                  aria-label={isDone ? `Décocher ${item.label}` : `Cocher ${item.label}`}
                  className={`flex size-[30px] shrink-0 items-center justify-center rounded-full text-base font-semibold disabled:opacity-50 ${
                    isDone
                      ? "bg-accent text-white"
                      : "border-2 border-app-line text-transparent"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-[17px] leading-snug ${isDone ? "text-app-done" : "text-app-ink"}`}>
                    {item.label}
                  </p>
                  {item.photos.length > 0 && (
                    <div className="mt-2.5 flex gap-2">
                      {(["before", "after"] as PhotoKind[]).flatMap((kind) =>
                        byKind(kind).map((photo) => (
                          <span
                            key={photo.id}
                            className="flex size-[52px] items-end justify-center rounded-xl bg-app-track pb-1 text-[8px] font-mono text-app-faint"
                            style={
                              photo.url
                                ? { backgroundImage: `url(${photo.url})`, backgroundSize: "cover" }
                                : undefined
                            }
                          >
                            {photo.url ? "" : kind === "before" ? "avant" : "après"}
                          </span>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {needsPhoto && !isDone && (
                  <Link
                    href={`/tasks/${taskId}/items/${item.id}`}
                    className="shrink-0 rounded-xl bg-accent-soft px-[11px] py-1.5 text-[11px] font-semibold text-accent"
                  >
                    {requirementLabel[item.photo_requirement]}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
