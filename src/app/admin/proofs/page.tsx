import { requireProfile } from "@/lib/get-profile";
import type { Apartment, Profile, Task, TaskItem, TaskPhoto } from "@/types/database";
import { ProofCard } from "./ProofCard";

type ProofTask = Task & {
  apartments: Pick<Apartment, "name"> | null;
  profiles: Pick<Profile, "full_name" | "email"> | null;
  task_items: Pick<TaskItem, "id" | "room" | "label" | "photo_requirement">[];
};

export default async function AdminProofsPage() {
  const { supabase } = await requireProfile();

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "*, apartments(name), profiles!tasks_assigned_to_fkey(full_name, email), task_items(id, room, label, photo_requirement)"
    )
    .eq("status", "done")
    .is("validated_at", null)
    .order("updated_at", { ascending: false })
    .returns<ProofTask[]>();

  const withPhotos = await Promise.all(
    (tasks ?? []).map(async (task) => {
      const { data: photos } = await supabase
        .from("task_photos")
        .select("*")
        .eq("task_id", task.id)
        .returns<TaskPhoto[]>();

      const signed = await Promise.all(
        (photos ?? []).map(async (photo) => {
          const { data } = await supabase.storage
            .from("task-photos")
            .createSignedUrl(photo.storage_path, 3600);
          return { ...photo, url: data?.signedUrl ?? null };
        })
      );

      return { task, photos: signed };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[15px] font-semibold">
        Preuves <span className="font-normal text-adm-faint">· {withPhotos.length} en attente</span>
      </h1>
      {withPhotos.length === 0 && (
        <p className="rounded-xl bg-adm-surface p-6 text-[13px] text-adm-faint">
          Rien à valider pour le moment.
        </p>
      )}
      {withPhotos.map(({ task, photos }) => (
        <ProofCard key={task.id} task={task} photos={photos} />
      ))}
    </div>
  );
}
