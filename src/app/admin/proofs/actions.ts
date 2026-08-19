"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function validateTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { error } = await supabase
    .from("tasks")
    .update({ validated_at: new Date().toISOString(), validated_by: user.id, redo_reason: null })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath("/admin/proofs");
}

export async function requestRedo(taskId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { data: task } = await supabase
    .from("tasks")
    .update({ status: "pending", redo_reason: reason, validated_at: null })
    .eq("id", taskId)
    .select("assigned_to, apartment_id")
    .single();

  if (task?.assigned_to) {
    await supabase.from("notifications").insert({
      recipient_id: task.assigned_to,
      sender_id: user.id,
      title: "Reprise demandée",
      body: reason,
      type: "urgent",
      related_task_id: taskId,
    });
  }

  revalidatePath("/admin/proofs");
}
