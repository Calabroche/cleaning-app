"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setRole(profileId: string, role: "admin" | "employee") {
  if (role !== "admin" && role !== "employee") return { error: "Rôle invalide." };

  const supabase = await createClient();

  // Un admin métier ne peut ni promouvoir quelqu'un super_admin, ni
  // rétrograder un compte super_admin existant — ça se gère uniquement
  // depuis /super-admin.
  const { data: target } = await supabase.from("profiles").select("role").eq("id", profileId).single();
  if (target?.role === "super_admin") return { error: "Ce compte est géré depuis l'espace super admin." };

  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { error: null };
}
