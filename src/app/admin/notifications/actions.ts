"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types/database";

export async function sendNotification(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const type = String(formData.get("type") || "info") as NotificationType;
  const recipient_id = String(formData.get("recipient_id") || "") || null;

  if (!title) return { error: "Le titre est requis." };

  const { error } = await supabase.from("notifications").insert({
    recipient_id,
    sender_id: user.id,
    title,
    body: body || null,
    type,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/notifications");
  return { error: null };
}
