"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const apartment_id = String(formData.get("apartment_id") || "");
  const assigned_to = String(formData.get("assigned_to") || "");
  const scheduled_date = String(formData.get("scheduled_date") || "");
  const title = String(formData.get("title") || "Ménage").trim();
  const description = String(formData.get("description") || "").trim();
  const is_urgent = formData.get("is_urgent") === "on";

  if (!apartment_id || !assigned_to || !scheduled_date) {
    return { error: "Appartement, employé·e et date sont requis." };
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      apartment_id,
      assigned_to,
      created_by: user.id,
      title: title || "Ménage",
      description: description || null,
      scheduled_date,
      is_urgent,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (is_urgent) {
    await supabase.from("notifications").insert({
      recipient_id: assigned_to,
      sender_id: user.id,
      title: "Tâche urgente",
      body: `${title} — ${scheduled_date}`,
      type: "urgent",
      related_task_id: task.id,
    });
  }

  revalidatePath("/admin/planning");
  return { error: null };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/admin/planning");
}
