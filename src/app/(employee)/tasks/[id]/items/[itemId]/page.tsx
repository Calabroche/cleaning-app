import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Task, TaskItem, TaskPhoto } from "@/types/database";
import { PhotoProof } from "./PhotoProof";

type TaskWithApartment = Task & { apartments: Pick<Apartment, "name"> | null };

export default async function ItemProofPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const { supabase, profile } = await requireProfile();
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";

  const [{ data: task }, { data: item }] = await Promise.all([
    supabase.from("tasks").select("*, apartments(name)").eq("id", id).single<TaskWithApartment>(),
    supabase.from("task_items").select("*").eq("id", itemId).single<TaskItem>(),
  ]);

  if (!task || !item) notFound();
  if (task.assigned_to !== profile.id && !isAdmin) notFound();

  const { data: photos } = await supabase
    .from("task_photos")
    .select("*")
    .eq("task_item_id", itemId)
    .returns<TaskPhoto[]>();

  const signed = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("task-photos")
        .createSignedUrl(photo.storage_path, 3600);
      return { ...photo, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 px-5 pt-5 pb-2">
        <Link
          href={`/tasks/${id}`}
          aria-label="Retour à la checklist"
          className="flex size-11 shrink-0 items-center justify-center rounded-control bg-app-surface text-lg shadow-soft"
        >
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold leading-tight">{item.label}</h1>
          <p className="mt-0.5 text-sm text-app-muted">
            {item.room} · {task.apartments?.name}
          </p>
        </div>
      </header>

      <PhotoProof taskId={id} item={item} photos={signed} />
    </div>
  );
}
