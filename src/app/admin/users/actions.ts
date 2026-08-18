"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types/database";

export async function setRole(profileId: string, role: Role) {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { error: null };
}
