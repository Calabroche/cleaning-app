import Image from "next/image";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Task, TaskPhoto } from "@/types/database";
import { StatusButtons } from "./StatusButtons";
import { PhotoUploader } from "./PhotoUploader";

type TaskWithApartment = Task & { apartments: Apartment | null };

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();

  const { data: task } = await supabase
    .from("tasks")
    .select("*, apartments(*)")
    .eq("id", id)
    .single<TaskWithApartment>();

  if (!task) notFound();
  if (task.assigned_to !== profile.id && profile.role !== "admin") notFound();

  const { data: photos } = await supabase
    .from("task_photos")
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: false })
    .returns<TaskPhoto[]>();

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("task-photos")
        .createSignedUrl(photo.storage_path, 3600);
      return { ...photo, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          {task.is_urgent && <span className="text-red-500">⚠ Urgent</span>}
          {task.apartments?.name ?? "Appartement"}
        </h1>
        {task.apartments?.address && (
          <p className="text-sm text-neutral-500">{task.apartments.address}</p>
        )}
      </div>

      {task.description && (
        <p className="rounded-lg bg-white p-3 text-sm text-neutral-700 shadow-sm">
          {task.description}
        </p>
      )}

      <StatusButtons taskId={task.id} current={task.status} />

      <div>
        <h2 className="mb-2 text-sm font-medium text-neutral-500">Photos</h2>
        <PhotoUploader taskId={task.id} />

        {photosWithUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photosWithUrls.map(
              (photo) =>
                photo.url && (
                  <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                    <Image src={photo.url} alt="" fill className="object-cover" unoptimized />
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
