import { notFound } from "next/navigation";
import Link from "next/link";
import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Task, TaskItem, TaskPhoto } from "@/types/database";
import { ChecklistSection } from "./ChecklistSection";
import { FinishButton } from "./FinishButton";

type TaskWithApartment = Task & { apartments: Apartment | null };

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";

  const { data: task } = await supabase
    .from("tasks")
    .select("*, apartments(*)")
    .eq("id", id)
    .single<TaskWithApartment>();

  if (!task) notFound();
  if (task.assigned_to !== profile.id && !isAdmin) notFound();

  const [{ data: items }, { data: photos }] = await Promise.all([
    supabase
      .from("task_items")
      .select("*")
      .eq("task_id", id)
      .order("room")
      .order("position")
      .returns<TaskItem[]>(),
    supabase.from("task_photos").select("*").eq("task_id", id).returns<TaskPhoto[]>(),
  ]);

  const signed = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("task-photos")
        .createSignedUrl(photo.storage_path, 3600);
      return { ...photo, url: data?.signedUrl ?? null };
    })
  );

  const rooms = (items ?? []).reduce<Record<string, TaskItem[]>>((acc, item) => {
    (acc[item.room] ??= []).push(item);
    return acc;
  }, {});

  const total = items?.length ?? 0;
  const done = (items ?? []).filter((i) => i.done_at).length;
  const remaining = total - done;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            aria-label="Retour"
            className="flex size-11 shrink-0 items-center justify-center rounded-control bg-app-surface text-lg shadow-soft"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-tight">
              {task.is_urgent && <span className="text-warn">⚠ </span>}
              {task.apartments?.name ?? "Appartement"}
            </h1>
            <p className="mt-0.5 text-sm text-app-muted">
              {done} sur {total} items · {task.title.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-app-track">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
      </header>

      <div className="flex-1 px-[18px]">
        {task.description && (
          <p className="mb-5 rounded-tile bg-app-surface p-[18px] text-[17px] leading-relaxed text-app-body shadow-soft">
            {task.description}
          </p>
        )}
        {Object.entries(rooms).map(([room, roomItems]) => (
          <ChecklistSection
            key={room}
            room={room}
            taskId={task.id}
            items={roomItems.map((item) => ({
              ...item,
              photos: signed.filter((p) => p.task_item_id === item.id),
            }))}
          />
        ))}
        {total === 0 && (
          <p className="rounded-card bg-app-sunken p-6 text-center text-[17px] text-app-muted">
            Aucune checklist rattachée à cet appartement.
          </p>
        )}
      </div>

      <div className="px-[18px] pt-3.5 pb-[22px]">
        <FinishButton taskId={task.id} remaining={remaining} />
      </div>
    </div>
  );
}
