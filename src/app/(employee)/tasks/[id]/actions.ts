"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/types/database";

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    profile_id: user.id,
    action: "task_status_change",
    metadata: { task_id: taskId, status },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function logPhotoUpload(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("activity_log").insert({
    profile_id: user.id,
    action: "photo_upload",
    metadata: { task_id: taskId },
  });

  revalidatePath(`/tasks/${taskId}`);
}
