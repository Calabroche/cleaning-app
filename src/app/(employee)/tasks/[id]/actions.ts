"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleTaskItem(itemId: string, taskId: string, done: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { error } = await supabase
    .from("task_items")
    .update({ done_at: done ? new Date().toISOString() : null, done_by: done ? user.id : null })
    .eq("id", itemId);

  if (error) return { error: error.message };

  if (done) {
    await supabase.from("tasks").update({ status: "in_progress" }).eq("id", taskId).eq("status", "pending");
  }

  await supabase.from("activity_log").insert({
    profile_id: user.id,
    action: "task_item_toggle",
    metadata: { task_id: taskId, item_id: itemId, done },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
}

export async function finishTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { count } = await supabase
    .from("task_items")
    .select("*", { count: "exact", head: true })
    .eq("task_id", taskId)
    .is("done_at", null);

  if (count && count > 0) return { error: `Il reste ${count} items.` };

  await supabase.from("tasks").update({ status: "done" }).eq("id", taskId);
  await supabase.from("activity_log").insert({
    profile_id: user.id,
    action: "task_status_change",
    metadata: { task_id: taskId, status: "done" },
  });

  revalidatePath("/dashboard");
}
