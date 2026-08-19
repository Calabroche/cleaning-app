"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createApartment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const template_id = String(formData.get("template_id") || "") || null;

  if (!name) return { error: "Le nom est requis." };

  const { error } = await supabase
    .from("apartments")
    .insert({ name, address: address || null, notes: notes || null, template_id, created_by: user.id });

  if (error) return { error: error.message };

  revalidatePath("/admin/apartments");
  return { error: null };
}

export async function setApartmentTemplate(apartmentId: string, templateId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("apartments")
    .update({ template_id: templateId })
    .eq("id", apartmentId);

  if (error) return { error: error.message };

  revalidatePath("/admin/apartments");
  return { error: null };
}
