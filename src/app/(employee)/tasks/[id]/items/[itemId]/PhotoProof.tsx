"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PhotoKind, TaskItem, TaskPhoto } from "@/types/database";
import { toggleTaskItem } from "../../actions";

type Photo = TaskPhoto & { url: string | null };

const slots: { kind: PhotoKind; label: string }[] = [
  { kind: "before", label: "Avant" },
  { kind: "after", label: "Après" },
];

export function PhotoProof({
  taskId,
  item,
  photos,
}: {
  taskId: string;
  item: TaskItem;
  photos: Photo[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<PhotoKind>("before");
  const [uploading, setUploading] = useState<PhotoKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsBefore = item.photo_requirement === "before_after";
  const shown = needsBefore ? slots : slots.filter((s) => s.kind === "after");
  const has = (kind: PhotoKind) => photos.some((p) => p.kind === kind);
  const complete = shown.every((s) => has(s.kind));

  function pick(kind: PhotoKind) {
    setTarget(kind);
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(target);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Non connecté.");
      setUploading(null);
      return;
    }

    const path = `${taskId}/${item.id}/${target}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("task-photos").upload(path, file);

    if (uploadError) {
      setError("Échec de l'envoi de la photo. Vérifie ta connexion et réessaie.");
      setUploading(null);
      return;
    }

    await supabase.from("task_photos").insert({
      task_id: taskId,
      task_item_id: item.id,
      kind: target,
      uploaded_by: user.id,
      storage_path: path,
    });

    setUploading(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <>
      <div className="flex-1 px-[18px] pt-3.5">
        <p className="mb-5 text-[17px] leading-relaxed text-app-body">
          {needsBefore
            ? "Prends une photo avant de commencer, puis une après. Les deux sont demandées pour cet item."
            : "Prends une photo une fois l'item terminé."}
        </p>

        <div className="flex flex-col gap-3.5">
          {shown.map(({ kind, label }) => {
            const photo = photos.find((p) => p.kind === kind);
            return (
              <div key={kind} className="rounded-card bg-app-surface p-4 shadow-lift">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[15px] font-semibold">{label}</p>
                  {photo ? (
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-accent">
                      <span className="size-2 rounded-full bg-accent" />
                      Envoyée
                    </span>
                  ) : (
                    <span className="text-[13px] text-app-faint">En attente</span>
                  )}
                </div>
                <div
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2.5 rounded-[14px] bg-app-sunken bg-cover bg-center"
                  style={photo?.url ? { backgroundImage: `url(${photo.url})` } : undefined}
                >
                  {!photo && (
                    <>
                      <span className="size-10 rounded-full bg-accent-soft" />
                      <span className="text-[15px] text-app-faint">Aucune photo</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => pick(kind)}
                  disabled={uploading !== null}
                  className={`mt-3 flex w-full items-center justify-center rounded-[14px] text-[15px] font-semibold disabled:opacity-60 ${
                    photo ? "h-[52px] bg-app-sunken text-app-muted" : "h-[60px] bg-accent text-[17px] text-white"
                  }`}
                >
                  {uploading === kind ? "Envoi…" : photo ? "Reprendre" : "Prendre la photo"}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4.5 flex items-center gap-3 rounded-control bg-warn-soft p-4">
            <span className="size-2 shrink-0 rounded-full bg-warn" />
            <p className="flex-1 text-[15px] leading-snug text-warn">{error}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div className="px-[18px] pt-3.5 pb-[22px]">
        <button
          type="button"
          disabled={!complete || isPending}
          onClick={() =>
            startTransition(async () => {
              await toggleTaskItem(item.id, taskId, true);
              router.push(`/tasks/${taskId}`);
            })
          }
          className={`h-[60px] w-full rounded-control text-[17px] font-semibold ${
            complete ? "bg-accent text-white" : "bg-app-track text-app-faint"
          }`}
        >
          Valider l&apos;item
        </button>
      </div>
    </>
  );
}
